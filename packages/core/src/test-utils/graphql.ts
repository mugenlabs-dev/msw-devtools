/**
 * Resolve the MSW `graphql` namespace on either major.
 *
 * Prefer the root `graphql` export (MSW 2). MSW 3 only ships `graphql.link`
 * from `msw/graphql`. On MSW 2, Vite configs alias `msw/graphql` to
 * `msw-graphql-shim.ts` so the fallback import is always analyzable and
 * never hits a missing package export at build time.
 */
// biome-ignore lint/suspicious/noExplicitAny: dual-major test loader, not a public type
type GraphqlNamespace = any;

const loadGraphqlNamespace = async (): Promise<GraphqlNamespace> => {
  const root = (await import("msw")) as { graphql?: GraphqlNamespace };
  const rootGraphql = root.graphql;
  if (rootGraphql && typeof rootGraphql.link === "function") {
    return rootGraphql;
  }

  const mod = (await import("msw/graphql")) as { graphql?: GraphqlNamespace };
  if (mod.graphql && typeof mod.graphql.link === "function") {
    return mod.graphql;
  }

  throw new Error("msw-devtools tests: could not resolve msw graphql namespace");
};

const namespace = await loadGraphqlNamespace();
const unscoped = typeof namespace.query === "function" ? namespace : namespace.link("*");

export const graphql: GraphqlNamespace = {
  link: namespace.link.bind(namespace),
  mutation: unscoped.mutation.bind(unscoped),
  operation: unscoped.operation.bind(unscoped),
  query: unscoped.query.bind(unscoped),
};
