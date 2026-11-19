/**
 * Ambient module so the dual-major test helper can `import("msw/graphql")`
 * when typechecking against MSW 2, which only exports GraphQL from the root.
 *
 * Only `tsconfig.msw2.json` includes this file. An ambient declaration wins over
 * the real package, so including it on MSW 3 would replace msw/graphql's types.
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
