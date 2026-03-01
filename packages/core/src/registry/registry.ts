import { GraphQLHandler, HttpHandler } from "msw";

import { useMockStore } from "#/store/store";
import type {
  GraphQLMockDescriptor,
  GraphQLOperationType,
  GraphqlMockDef,
  HandlerVariant,
  HandlerVariantInput,
  MockOperationDescriptor,
  RestMethod,
  RestMockDef,
  RestMockDescriptor,
} from "./types";

// ---------------------------------------------------------------------------
// MockRegistry — singleton that stores all registered descriptors
// ---------------------------------------------------------------------------

class MockRegistry {
  private readonly descriptors = new Map<string, MockOperationDescriptor>();
  private readonly listeners = new Set<() => void>();
  private snapshot: MockOperationDescriptor[] = [];

  /** Register one or more descriptors. Overwrites if operationName already exists. */
  register(...descriptors: MockOperationDescriptor[]): void {
    for (const d of descriptors) {
      this.descriptors.set(d.operationName, d);
    }
    this.snapshot = [...this.descriptors.values()];
    this.notify();
  }

  /** Remove a descriptor by operationName. */
  unregister(operationName: string): void {
    this.descriptors.delete(operationName);
    this.snapshot = [...this.descriptors.values()];
    this.notify();
  }

  /** Get all registered descriptors as a cached array. Safe for useSyncExternalStore. */
  getAll(): MockOperationDescriptor[] {
    return this.snapshot;
  }

  /** Get a single descriptor by operationName. */
  get(operationName: string): MockOperationDescriptor | undefined {
    return this.descriptors.get(operationName);
  }

  /** Subscribe to registry changes. Returns unsubscribe fn. */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  get size(): number {
    return this.descriptors.size;
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

/** @internal — Singleton registry instance. Not part of the public API. */
export const mockRegistry = new MockRegistry();

// ---------------------------------------------------------------------------
// Introspection helpers
// ---------------------------------------------------------------------------

/** Strip the origin from a full URL to produce a readable display path. */
const toDisplayPath = (path: string): string => {
  try {
    return new URL(path).pathname;
  } catch {
    return path;
  }
};

/** Normalise a HandlerVariantInput into a HandlerVariant with id and label. */
const normaliseVariant = <H extends HttpHandler | GraphQLHandler>(
  input: HandlerVariantInput<H>,
  index: number
): HandlerVariant => {
  const isObject =
    typeof input === "object" &&
    input !== null &&
    "handler" in input &&
    !(input instanceof HttpHandler) &&
    !(input instanceof GraphQLHandler);

  const handler = isObject ? (input as { handler: H; label?: string }).handler : (input as H);
  const label = isObject ? (input as { handler: H; label?: string }).label : undefined;

  return {
    handler,
    id: `variant-${index}`,
    label: label ?? (index === 0 ? "Default" : `Variant ${index + 1}`),
  };
};

/** Extract the list of handlers from a mock def that has either `handler` or `variants`. */
const extractVariants = <H extends HttpHandler | GraphQLHandler>(def: {
  handler?: H;
  variants?: HandlerVariantInput<H>[];
}): HandlerVariant[] => {
  if (def.variants && def.variants.length > 0) {
    return def.variants.map((v, i) => normaliseVariant(v, i));
  }
  if (def.handler) {
    return [normaliseVariant(def.handler, 0)];
  }
  throw new Error("msw-devtool: registerMock requires either `handler` or `variants`.");
};

/** Get the primary (first) handler for introspection. */
const getPrimaryHandler = (variants: HandlerVariant[]): HttpHandler | GraphQLHandler => {
  if (variants.length === 0) {
    throw new Error("msw-devtool: at least one handler variant is required.");
  }
  return variants[0].handler;
};

// ---------------------------------------------------------------------------
// Eager response capture — pre-populate JSON editor with default handler data
// ---------------------------------------------------------------------------

const eagerCaptureDefaultResponses = async (
  descriptors: MockOperationDescriptor[]
): Promise<void> => {
  await Promise.all(
    descriptors.map(async (descriptor) => {
      const variant = descriptor.variants[0];
      if (!variant) {
        return;
      }
      try {
        const resolver = (
          variant.handler as unknown as {
            resolver: (info: unknown) => Promise<Response>;
          }
        ).resolver;
        const response = await resolver({});
        if (response) {
          const cloned = response.clone();
          const body = await cloned.json();
          useMockStore
            .getState()
            .setCapturedResponse(descriptor.operationName, JSON.stringify(body, null, 2));
        }
      } catch {
        // Handler may require request context — skip silently
      }
    })
  );
};

// ---------------------------------------------------------------------------
// Public registration functions
// ---------------------------------------------------------------------------

/**
 * Register one or more REST mocks from MSW HttpHandlers.
 * Operation metadata (method, path, operationName) is auto-derived from handler info.
 */
export const registerRestMocks = (...defs: RestMockDef[]): void => {
  const descriptors: RestMockDescriptor[] = [];

  for (const def of defs) {
    const variants = extractVariants(def);
    const primary = getPrimaryHandler(variants);
    const info = primary.info as unknown as Record<string, unknown>;

    const method = (
      typeof info.method === "string" ? info.method.toLowerCase() : "get"
    ) as RestMethod;
    const path = typeof info.path === "string" ? info.path : "";
    const operationName = def.operationName ?? `${method.toUpperCase()} ${toDisplayPath(path)}`;

    descriptors.push({
      group: def.group,
      method,
      operationName,
      path,
      type: "rest",
      variants,
    });
  }

  mockRegistry.register(...descriptors);
  void eagerCaptureDefaultResponses(descriptors);
};

/**
 * Register one or more GraphQL mocks from MSW GraphqlHandlers.
 * Operation metadata (operationName, operationType) is auto-derived from handler info.
 */
export const registerGraphqlMocks = (...defs: GraphqlMockDef[]): void => {
  const descriptors: GraphQLMockDescriptor[] = [];

  for (const def of defs) {
    const variants = extractVariants(def);
    const primary = getPrimaryHandler(variants);
    const info = primary.info as unknown as Record<string, unknown>;

    const operationName =
      def.operationName ??
      (typeof info.operationName === "string" ? info.operationName : "UnknownOperation");
    const operationType: GraphQLOperationType =
      def.operationType ?? (info.operationType === "mutation" ? "mutation" : "query");

    descriptors.push({
      group: def.group,
      operationName,
      operationType,
      type: "graphql",
      variants,
    });
  }

  mockRegistry.register(...descriptors);
  void eagerCaptureDefaultResponses(descriptors);
};
