import { GraphQLHandler, HttpHandler } from "msw";

import { getGraphQLEndpoint, getHandlerOptions, getHandlerResolver } from "#/msw/msw-internals";
import { useMockStore } from "#/store/store";
import type {
  GraphQLMockDescriptor,
  GraphQLOperationType,
  GraphqlMockDef,
  HandlerVariant,
  HandlerVariantInput,
  MockOperationDescriptor,
  OperationHandle,
  OperationHandles,
  OperationHandlesFor,
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
const toDisplayPath = (path: string | RegExp): string => {
  if (path instanceof RegExp) {
    return path.toString();
  }
  try {
    return new URL(path).pathname;
  } catch {
    return path;
  }
};

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "") || "variant";

/** Small, dependency-free string hash (djb2 xor), rendered in base 36. */
const hashString = (value: string): string => {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    // biome-ignore lint/suspicious/noBitwiseOperators: intentional 32-bit hash arithmetic
    hash = ((hash * 33) ^ value.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
};

/**
 * A variant id that survives reordering: the label when one was given,
 * otherwise a hash of the handler's resolver source.
 */
const variantIdFor = (handler: HttpHandler | GraphQLHandler, label: string | undefined): string =>
  label === undefined
    ? `handler-${hashString(getHandlerResolver(handler).toString())}`
    : slugify(label);

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

  const options = getHandlerOptions(handler);

  return {
    handler,
    id: variantIdFor(handler, label),
    label: label ?? (index === 0 ? "Default" : `Variant ${index + 1}`),
    ...(options ? { options } : {}),
  };
};

/** Suffix duplicate ids within one operation so every variant stays selectable. */
const dedupeVariantIds = (variants: HandlerVariant[]): HandlerVariant[] => {
  const seen = new Map<string, number>();
  return variants.map((variant) => {
    const count = seen.get(variant.id) ?? 0;
    seen.set(variant.id, count + 1);
    return count === 0 ? variant : { ...variant, id: `${variant.id}-${count + 1}` };
  });
};

/** Extract the list of handlers from a mock def that has either `handler` or `variants`. */
const extractVariants = <H extends HttpHandler | GraphQLHandler>(def: {
  handler?: H;
  variants?: HandlerVariantInput<H>[];
}): HandlerVariant[] => {
  if (def.variants && def.variants.length > 0) {
    return dedupeVariantIds(def.variants.map((v, i) => normaliseVariant(v, i)));
  }
  if (def.handler) {
    return [normaliseVariant(def.handler, 0)];
  }
  throw new Error("msw-devtools: registerMock requires either `handler` or `variants`.");
};

/** Get the primary (first) handler for introspection. */
const getPrimaryHandler = (variants: HandlerVariant[]): HttpHandler | GraphQLHandler => {
  if (variants.length === 0) {
    throw new Error("msw-devtools: at least one handler variant is required.");
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
      const [variant] = descriptor.variants;
      if (!variant) {
        return;
      }
      try {
        const resolver = getHandlerResolver(variant.handler);
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
// Operation handle construction
// ---------------------------------------------------------------------------

/**
 * Build the {@link OperationHandles} return value from registered descriptors:
 * an array of branded handles that is also indexable by `operationName`.
 */
const buildOperationHandles = (descriptors: MockOperationDescriptor[]): OperationHandles => {
  const handles = descriptors.map(
    (descriptor): OperationHandle => ({ operationName: descriptor.operationName })
  );
  const indexed = handles as OperationHandle[] & Record<string, OperationHandle>;
  for (const handle of handles) {
    indexed[handle.operationName] = handle;
  }
  return indexed as OperationHandles;
};

// ---------------------------------------------------------------------------
// Public registration functions
// ---------------------------------------------------------------------------

/**
 * Register one or more REST mocks from MSW HttpHandlers.
 * Operation metadata (method, path, operationName) is auto-derived from handler info.
 *
 * @returns type-safe {@link OperationHandlesFor} — a tuple of handles (destructurable
 * in registration order) that is also indexable by `operationName`. With explicit
 * `operationName`s the keys are literal, so typos are caught at compile time.
 * Pass a handle to `useMockRefetch` to avoid hard-coding operation-name strings.
 */
export const registerRestMocks = <const Defs extends readonly RestMockDef[]>(
  ...defs: Defs
): OperationHandlesFor<Defs> => {
  const descriptors: RestMockDescriptor[] = [];

  for (const def of defs) {
    const variants = extractVariants(def);
    const primary = getPrimaryHandler(variants);
    const info = primary.info as unknown as Record<string, unknown>;

    const method = (
      typeof info.method === "string" ? info.method.toLowerCase() : "get"
    ) as RestMethod;
    const path = typeof info.path === "string" || info.path instanceof RegExp ? info.path : "";
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

  return buildOperationHandles(descriptors) as unknown as OperationHandlesFor<Defs>;
};

/**
 * Register one or more GraphQL mocks from MSW GraphqlHandlers.
 * Operation metadata (operationName, operationType) is auto-derived from handler info.
 *
 * @returns type-safe {@link OperationHandlesFor} — a tuple of handles (destructurable
 * in registration order) that is also indexable by `operationName`. With explicit
 * `operationName`s the keys are literal, so typos are caught at compile time.
 * Pass a handle to `useMockRefetch` to avoid hard-coding operation-name strings.
 */
export const registerGraphqlMocks = <const Defs extends readonly GraphqlMockDef[]>(
  ...defs: Defs
): OperationHandlesFor<Defs> => {
  const descriptors: GraphQLMockDescriptor[] = [];

  for (const def of defs) {
    const variants = extractVariants(def);
    const primary = getPrimaryHandler(variants);
    const info = primary.info as unknown as Record<string, unknown>;

    const handlerOperationName = info.operationName;
    const graphqlOperationName =
      typeof handlerOperationName === "string" || handlerOperationName instanceof RegExp
        ? handlerOperationName
        : "UnknownOperation";
    const operationName =
      def.operationName ??
      (typeof graphqlOperationName === "string" ? graphqlOperationName : "UnknownOperation");
    const operationType: GraphQLOperationType =
      def.operationType ?? (info.operationType === "mutation" ? "mutation" : "query");

    descriptors.push({
      endpoint: getGraphQLEndpoint(primary as GraphQLHandler),
      graphqlOperationName,
      group: def.group,
      operationName,
      operationType,
      type: "graphql",
      variants,
    });
  }

  mockRegistry.register(...descriptors);
  void eagerCaptureDefaultResponses(descriptors);

  return buildOperationHandles(descriptors) as unknown as OperationHandlesFor<Defs>;
};
