/**
 * Accessors for MSW handler internals.
 *
 * MSW keeps `resolver`, `options` and the GraphQL `endpoint` as private class
 * fields, so they are read here through a single set of runtime-checked
 * accessors. If an MSW release changes the shape, it fails loudly in one place
 * instead of silently producing handlers that never match.
 *
 * GraphQLHandler / `graphql` are not imported from `msw`: on 3.x they live only
 * under `msw/graphql`, and `graphql.link().operation()` also attaches a hidden
 * subscription sibling. Wrappers are built from the user's handler constructor
 * instead (same signature in 2.15 and 3.0.3).
 *
 * Handler types are structural so consumers are not coupled to a specific MSW
 * install identity (and so GraphQLHandler need not be imported from either path).
 */

/**
 * REST handler shape from `http.*` (MSW 2 or 3).
 * `info` fields stay loose so MSW's predicate unions (string | RegExp | function)
 * remain assignable without coupling to a specific MSW install identity.
 */
export interface RestHandler {
  readonly info: {
    readonly header: string;
    readonly method?: unknown;
    readonly path?: unknown;
  };
}

/**
 * GraphQL handler from MSW 2 (`import { graphql } from "msw"`) or
 * MSW 3 (`import { graphql } from "msw/graphql"`).
 */
export interface GraphqlHandler {
  readonly info: {
    readonly header: string;
    readonly operationName?: unknown;
    readonly operationType?: unknown;
  };
}

export type AnyHandler = GraphqlHandler | RestHandler;

/** The subset of MSW's `RequestHandlerOptions` the devtools preserve. */
export interface HandlerOptions {
  once?: boolean;
}

export type HandlerResolver = (info: unknown) => Promise<Response | undefined>;

type GraphqlHandlerConstructor = new (
  operationType: string,
  predicate: string | RegExp,
  endpoint: string | RegExp,
  resolver: HandlerResolver,
  options?: HandlerOptions
) => GraphqlHandler;

const unsupported = (field: string): Error =>
  new Error(
    `msw-devtools: unsupported MSW handler shape (missing \`${field}\`). ` +
      "This version of msw-devtools may not support the installed msw version."
  );

/** True for an MSW request handler (REST or GraphQL), not a `{ handler, label }` object. */
export const isMswRequestHandler = (value: unknown): value is AnyHandler =>
  typeof value === "object" &&
  value !== null &&
  "run" in value &&
  typeof (value as { run: unknown }).run === "function" &&
  "info" in value;

/** True when the handler carries GraphQL `info.operationType` (query/mutation/all). */
export const isGraphqlHandler = (handler: unknown): handler is GraphqlHandler => {
  if (!isMswRequestHandler(handler)) {
    return false;
  }
  const { info } = handler as { info?: unknown };
  return (
    typeof info === "object" && info !== null && "operationType" in info && "operationName" in info
  );
};

/** The user's resolver function as passed to `http.*` / `graphql.*`. */
export const getHandlerResolver = (handler: AnyHandler): HandlerResolver => {
  const { resolver } = handler as unknown as { resolver?: unknown };
  if (typeof resolver !== "function") {
    throw unsupported("resolver");
  }
  return resolver as HandlerResolver;
};

/** Handler options such as `{ once: true }`, or undefined when none were given. */
export const getHandlerOptions = (handler: AnyHandler): HandlerOptions | undefined => {
  const { options } = handler as unknown as { options?: unknown };
  if (typeof options !== "object" || options === null) {
    return undefined;
  }
  const { once } = options as { once?: unknown };
  return typeof once === "boolean" ? { once } : undefined;
};

/**
 * The endpoint a GraphQL handler is scoped to via `graphql.link(url)`.
 * Handlers built against `"*"` (MSW 2 unscoped query, or `link("*")`) use that.
 */
export const getGraphQLEndpoint = (handler: GraphqlHandler): string | RegExp => {
  const { endpoint } = handler as unknown as { endpoint?: unknown };
  if (typeof endpoint === "string" || endpoint instanceof RegExp) {
    return endpoint;
  }
  return "*";
};

/**
 * Build a GraphQL wrapper with the same class as the user's handler.
 * Avoids importing `graphql` / `GraphQLHandler` and avoids MSW 3's
 * `link.operation()` subscription sibling.
 */
export const createGraphqlHandlerFrom = (
  prototype: GraphqlHandler,
  args: {
    endpoint: string | RegExp;
    operationType: "query" | "mutation" | "operation";
    options?: HandlerOptions;
    predicate: string | RegExp;
    resolver: HandlerResolver;
  }
): GraphqlHandler => {
  const Ctor = (prototype as unknown as { constructor: GraphqlHandlerConstructor }).constructor;
  if (typeof Ctor !== "function") {
    throw unsupported("GraphQLHandler.constructor");
  }
  const mswOperationType = args.operationType === "operation" ? "all" : args.operationType;
  const predicate = args.operationType === "operation" ? /.*/ : args.predicate;
  return new Ctor(mswOperationType, predicate, args.endpoint, args.resolver, args.options);
};
