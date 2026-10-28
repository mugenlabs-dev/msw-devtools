import { delay, HttpResponse, http, passthrough } from "msw";
import type { HandlerVariant, MockOperationDescriptor } from "#/registry/types";
import { isGraphQLDescriptor, isRestDescriptor, resolveActiveVariant } from "#/registry/types";
import { useMockStore } from "#/store/store";
import type { ErrorOverride, OperationMockConfig } from "#/store/types";
import { createGraphqlHandlerFrom, getHandlerResolver, isGraphqlHandler } from "./msw-internals";

// ---------------------------------------------------------------------------
// Generic error responses
// ---------------------------------------------------------------------------

const ERROR_MESSAGES: Record<number, string> = {
  401: "Unauthorized",
  404: "Not Found",
  429: "Too Many Requests",
  500: "Internal Server Error",
};

const buildErrorResponse = (code: number): Response =>
  HttpResponse.json({ error: ERROR_MESSAGES[code] ?? "Error", status: code }, { status: code });

// ---------------------------------------------------------------------------
// Status code overrides
// ---------------------------------------------------------------------------

/** The `Response` constructor only accepts status codes in this range. */
const MIN_STATUS_CODE = 200;
const MAX_STATUS_CODE = 599;

/** Statuses that must not carry a body (the `Response` constructor throws otherwise). */
const NULL_BODY_STATUS_CODES = new Set([204, 205, 304]);

/**
 * Only apply status overrides the platform can actually represent. Partial
 * values typed into the status input (e.g. "2" on the way to "204") are ignored
 * rather than crashing the resolver.
 */
const resolveStatusOverride = (statusCode: number | null): number | null =>
  statusCode != null &&
  Number.isInteger(statusCode) &&
  statusCode >= MIN_STATUS_CODE &&
  statusCode <= MAX_STATUS_CODE
    ? statusCode
    : null;

// ---------------------------------------------------------------------------
// Response capture — lazily store the handler's response for the JSON editor
// ---------------------------------------------------------------------------

/**
 * Only JSON bodies are read. Reading any other body (a stream, server-sent
 * events, a large file) would wait for it to finish, or never return.
 */
export const isJsonResponse = (response: Response): boolean => {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  return contentType.includes("application/json") || contentType.includes("+json");
};

/** Fire-and-forget: the response is returned without waiting for the capture. */
const captureResponseBody = (operationName: string, response: Response): void => {
  if (!isJsonResponse(response)) {
    return;
  }
  response
    .clone()
    .json()
    .then((body: unknown) => {
      useMockStore.getState().setCapturedResponse(operationName, JSON.stringify(body, null, 2));
    })
    .catch(() => {
      // Invalid JSON — skip capture
    });
};

// ---------------------------------------------------------------------------
// Override application — mutate the handler response with user overrides
// ---------------------------------------------------------------------------

const readJsonBody = async (
  response: Response
): Promise<{ body: unknown; isJson: true } | { body: null; isJson: false }> => {
  if (!isJsonResponse(response)) {
    return { body: null, isJson: false };
  }
  try {
    return { body: await response.clone().json(), isJson: true };
  } catch {
    return { body: null, isJson: false };
  }
};

/**
 * Merge the user's header overrides into the response headers: a listed header
 * replaces the original value, every other original header is kept. Invalid
 * JSON or an invalid header name or value is skipped rather than turning the
 * mocked response into a 500.
 */
const applyHeaderOverrides = (headers: Headers, customHeaders: string): void => {
  let overrides: unknown;
  try {
    overrides = JSON.parse(customHeaders);
  } catch {
    return;
  }
  if (typeof overrides !== "object" || overrides === null || Array.isArray(overrides)) {
    return;
  }
  for (const [key, value] of Object.entries(overrides)) {
    try {
      headers.set(key, String(value));
    } catch {
      // Invalid header name or value — skip it
    }
  }
};

const applyOverrides = async (
  original: Response,
  config: OperationMockConfig
): Promise<Response> => {
  const hasJsonOverride = config.customJsonOverride != null && config.customJsonOverride !== "";
  const hasHeaderOverride = config.customHeaders != null && config.customHeaders !== "";
  const statusOverride = resolveStatusOverride(config.statusCode);

  // If nothing to override, return as-is
  if (!(hasJsonOverride || statusOverride != null || hasHeaderOverride)) {
    return original;
  }

  // Resolve the body: a valid JSON override wins, otherwise fall back to the
  // handler's own body. Non-JSON bodies (text, HTML, binary) are passed through
  // untouched rather than being re-serialised as `null`.
  let body: unknown;
  let hasJsonBody = false;
  if (hasJsonOverride) {
    try {
      body = JSON.parse(config.customJsonOverride as string);
      hasJsonBody = true;
    } catch {
      // Invalid override JSON — fall through to the original body
    }
  }
  if (!hasJsonBody) {
    ({ body, isJson: hasJsonBody } = await readJsonBody(original));
  }

  // Resolve status
  const status = statusOverride ?? original.status;

  // Resolve headers. Skip entity headers that describe the original payload —
  // the body is re-serialized below, so stale content-length/content-encoding/
  // transfer-encoding would misdescribe it.
  const headers = new Headers();
  original.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey === "content-length" ||
      lowerKey === "content-encoding" ||
      lowerKey === "transfer-encoding"
    ) {
      return;
    }
    headers.set(key, value);
  });
  if (hasHeaderOverride) {
    applyHeaderOverrides(headers, config.customHeaders as string);
  }

  if (NULL_BODY_STATUS_CODES.has(status)) {
    return new HttpResponse(null, { headers, status });
  }

  if (!hasJsonBody) {
    return new HttpResponse(original.clone().body, { headers, status });
  }

  return HttpResponse.json(body as Record<string, unknown>, { headers, status });
};

// ---------------------------------------------------------------------------
// Core handler resolution — shared logic for REST and GraphQL wrappers
// ---------------------------------------------------------------------------

const resolveAndRespond = async (
  descriptor: MockOperationDescriptor,
  resolverInfo: unknown
): Promise<Response | undefined> => {
  const config = useMockStore.getState().operations[descriptor.operationName];
  if (!config?.enabled) {
    return passthrough() as unknown as Response;
  }

  // Apply delay
  if (config.delay > 0) {
    await delay(config.delay);
  }

  // Error override takes priority
  const errorOverride = config.errorOverride as ErrorOverride;
  if (errorOverride === "networkError") {
    return HttpResponse.error();
  }
  if (errorOverride != null) {
    return buildErrorResponse(errorOverride as number);
  }

  // Find active variant handler (falls back to the first variant)
  const variant: HandlerVariant | undefined = resolveActiveVariant(
    descriptor,
    config.activeVariantId
  );
  if (!variant) {
    return passthrough() as unknown as Response;
  }

  // Call the user's handler resolver
  const resolver = getHandlerResolver(variant.handler);
  const response = await resolver(resolverInfo);

  if (!response) {
    return passthrough() as unknown as Response;
  }

  // Capture response body for JSON editor
  captureResponseBody(descriptor.operationName, response);

  // Apply user overrides (custom JSON, status code, headers)
  return applyOverrides(response, config);
};

// ---------------------------------------------------------------------------
// Dynamic handler creation — wraps user handlers with DevTools logic
// ---------------------------------------------------------------------------

/**
 * Handler options come from the first variant: the wrapper is a single MSW
 * handler, so `once` can only apply to the operation as a whole.
 */
const primaryOptions = (descriptor: MockOperationDescriptor) => descriptor.variants[0]?.options;

const createRestHandler = (descriptor: Extract<MockOperationDescriptor, { type: "rest" }>) => {
  const httpMethod = http[descriptor.method];

  return httpMethod(
    descriptor.path,
    (info) => resolveAndRespond(descriptor, info),
    primaryOptions(descriptor)
  );
};

const createGraphQLHandler = (
  descriptor: Extract<MockOperationDescriptor, { type: "graphql" }>
) => {
  const prototype = descriptor.variants[0]?.handler;
  if (!(prototype && isGraphqlHandler(prototype))) {
    throw new Error(
      `msw-devtools: GraphQL operation "${descriptor.operationName}" needs a GraphQL handler variant.`
    );
  }

  return createGraphqlHandlerFrom(prototype, {
    endpoint: descriptor.endpoint,
    operationType: descriptor.operationType,
    options: primaryOptions(descriptor),
    predicate: descriptor.graphqlOperationName,
    resolver: (info) => resolveAndRespond(descriptor, info),
  });
};

/**
 * Runtime MSW handler instance. Typed structurally so GraphQL wrappers built
 * from the user's constructor stay dual-major without importing GraphQLHandler.
 */
export interface DynamicHandler {
  run: (args: { request: Request; requestId: string }) => Promise<{ response?: Response } | null>;
}

export const createDynamicHandler = (descriptor: MockOperationDescriptor): DynamicHandler => {
  if (isGraphQLDescriptor(descriptor)) {
    return createGraphQLHandler(descriptor) as unknown as DynamicHandler;
  }
  if (isRestDescriptor(descriptor)) {
    return createRestHandler(descriptor) as unknown as DynamicHandler;
  }
  throw new Error(
    `Unknown descriptor type for operation: ${(descriptor as MockOperationDescriptor).operationName}`
  );
};
