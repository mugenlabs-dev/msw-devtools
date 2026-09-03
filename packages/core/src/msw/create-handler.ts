import { delay, graphql, HttpResponse, http, passthrough } from "msw";
import type { HandlerVariant, MockOperationDescriptor } from "#/registry/types";
import { isGraphQLDescriptor, isRestDescriptor, resolveActiveVariant } from "#/registry/types";
import { useMockStore } from "#/store/store";
import type { ErrorOverride, OperationMockConfig } from "#/store/types";
import { getHandlerResolver } from "./msw-internals";

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

const captureResponseBody = async (operationName: string, response: Response): Promise<void> => {
  try {
    const cloned = response.clone();
    const body = await cloned.json();
    useMockStore.getState().setCapturedResponse(operationName, JSON.stringify(body, null, 2));
  } catch {
    // Non-JSON response — skip capture
  }
};

// ---------------------------------------------------------------------------
// Override application — mutate the handler response with user overrides
// ---------------------------------------------------------------------------

const readJsonBody = async (
  response: Response
): Promise<{ body: unknown; isJson: true } | { body: null; isJson: false }> => {
  try {
    return { body: await response.clone().json(), isJson: true };
  } catch {
    return { body: null, isJson: false };
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
  let headers: Record<string, string> = {};
  original.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey === "content-length" ||
      lowerKey === "content-encoding" ||
      lowerKey === "transfer-encoding"
    ) {
      return;
    }
    headers[key] = value;
  });
  if (config.customHeaders != null && config.customHeaders !== "") {
    try {
      headers = JSON.parse(config.customHeaders) as Record<string, string>;
    } catch {
      // Invalid JSON — keep original headers
    }
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
  await captureResponseBody(descriptor.operationName, response);

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
  const link = graphql.link(descriptor.endpoint);
  const gqlMethod = descriptor.operationType === "query" ? link.query : link.mutation;

  return gqlMethod(
    descriptor.graphqlOperationName,
    (info) => resolveAndRespond(descriptor, info),
    primaryOptions(descriptor)
  );
};

export const createDynamicHandler = (descriptor: MockOperationDescriptor) => {
  if (isGraphQLDescriptor(descriptor)) {
    return createGraphQLHandler(descriptor);
  }
  if (isRestDescriptor(descriptor)) {
    return createRestHandler(descriptor);
  }
  throw new Error(
    `Unknown descriptor type for operation: ${(descriptor as MockOperationDescriptor).operationName}`
  );
};
