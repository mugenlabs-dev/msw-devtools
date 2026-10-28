/**
 * Ambient module so the dual-major test helper can `import("msw/graphql")`
 * when typechecking against MSW 2, which only exports GraphQL from the root.
 * On MSW 3 the real package export takes precedence.
 */
declare module "msw/graphql" {
  export const graphql: {
    link: (url: string | RegExp) => {
      mutation: (...args: unknown[]) => unknown;
      operation: (...args: unknown[]) => unknown;
      query: (...args: unknown[]) => unknown;
      subscription?: (...args: unknown[]) => unknown;
    };
    mutation: (...args: unknown[]) => unknown;
    operation: (...args: unknown[]) => unknown;
    query: (...args: unknown[]) => unknown;
    subscription?: (...args: unknown[]) => unknown;
  };
}
