import { delay, graphql, HttpResponse, http, passthrough } from "msw";
import type { HandlerVariant, MockOperationDescriptor } from "#/registry/types";
import { isGraphQLDescriptor, isRestDescriptor } from "#/registry/types";
import { useMockStore } from "#/store/store";
import type { ErrorOverride, OperationMockConfig } from "#/store/types";

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

const applyOverrides = async (
  original: Response,
  config: OperationMockConfig
): Promise<Response> => {
  const hasJsonOverride = config.customJsonOverride != null && config.customJsonOverride !== "";
  const hasStatusOverride = config.statusCode != null;
  const hasHeaderOverride = config.customHeaders != null && config.customHeaders !== "";

  // If nothing to override, return as-is
  if (!(hasJsonOverride || hasStatusOverride || hasHeaderOverride)) {
    return original;
  }

  // Read original body if needed
  let body: unknown;
  if (hasJsonOverride) {
    try {
      body = JSON.parse(config.customJsonOverride as string);
    } catch {
      body = await original
        .clone()
        .json()
        .catch(() => null);
    }
  } else {
    body = await original
      .clone()
      .json()
      .catch(() => null);
  }

  // Resolve status
  const status = config.statusCode ?? original.status;

  // Resolve headers
  let headers: Record<string, string> = {};
  original.headers.forEach((value, key) => {
    headers[key] = value;
  });
  if (hasHeaderOverride) {
    try {
      headers = JSON.parse(config.customHeaders as string) as Record<string, string>;
    } catch {
      // Invalid JSON — keep original headers
    }
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

  // Find active variant handler
  const variant: HandlerVariant | undefined = descriptor.variants.find(
    (v) => v.id === config.activeVariantId
  );
  if (!variant) {
    return passthrough() as unknown as Response;
  }

  // Call the user's handler resolver
  const resolver = (
    variant.handler as unknown as { resolver: (info: unknown) => Promise<Response> }
  ).resolver;
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

const createRestHandler = (descriptor: Extract<MockOperationDescriptor, { type: "rest" }>) => {
  const httpMethod = http[descriptor.method];

  return httpMethod(descriptor.path, (info) => resolveAndRespond(descriptor, info));
};

const createGraphQLHandler = (
  descriptor: Extract<MockOperationDescriptor, { type: "graphql" }>
) => {
  const gqlMethod = descriptor.operationType === "query" ? graphql.query : graphql.mutation;

  return gqlMethod(descriptor.operationName, (info) => resolveAndRespond(descriptor, info));
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
