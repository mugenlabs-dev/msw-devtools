import type { GraphQLHandler, HttpHandler } from "msw";

/**
 * Accessors for MSW handler internals.
 *
 * MSW keeps `resolver`, `options` and the GraphQL `endpoint` as private class
 * fields, so they are read here through a single set of runtime-checked
 * accessors. If an MSW release changes the shape, it fails loudly in one place
 * instead of silently producing handlers that never match.
 */

export type AnyHandler = GraphQLHandler | HttpHandler;

/** The subset of MSW's `RequestHandlerOptions` the devtools preserve. */
export interface HandlerOptions {
  once?: boolean;
}

export type HandlerResolver = (info: unknown) => Promise<Response | undefined>;

const unsupported = (field: string): Error =>
  new Error(
    `msw-devtools: unsupported MSW handler shape (missing \`${field}\`). ` +
      "This version of msw-devtools may not support the installed msw version."
  );

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
 * Unscoped `graphql.query(...)` handlers use MSW's `"*"` wildcard.
 */
export const getGraphQLEndpoint = (handler: GraphQLHandler): string | RegExp => {
  const { endpoint } = handler as unknown as { endpoint?: unknown };
  if (typeof endpoint === "string" || endpoint instanceof RegExp) {
    return endpoint;
  }
  return "*";
};
