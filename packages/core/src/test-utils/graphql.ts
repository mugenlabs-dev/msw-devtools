/**
 * Resolve the MSW `graphql` namespace on either major.
 *
 * Prefer `msw/graphql` (MSW 3). Fall back to the `msw` root export (MSW 2),
 * which already exposes `graphql.link`. When only `link` exists, synthesize
 * unscoped `query` / `mutation` / `operation` from `link("*")`.
 */
// biome-ignore lint/suspicious/noExplicitAny: dual-major test loader, not a public type
type GraphqlNamespace = any;

const loadGraphqlNamespace = async (): Promise<GraphqlNamespace> => {
  try {
    const mod = (await import(/* @vite-ignore */ "msw/graphql")) as {
      graphql?: GraphqlNamespace;
    };
    if (mod.graphql && typeof mod.graphql.link === "function") {
      return mod.graphql;
    }
  } catch {
    // MSW 2 has no `msw/graphql` export.
  }

  const root = (await import("msw")) as { graphql?: GraphqlNamespace };
  if (root.graphql && typeof root.graphql.link === "function") {
    return root.graphql;
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
