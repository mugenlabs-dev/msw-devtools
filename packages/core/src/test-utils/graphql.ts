/**
 * Resolve the MSW `graphql` namespace on either major.
 *
 * MSW 2 exports `graphql` (with `.link`) from `msw`.
 * MSW 3 only exports `graphql.link` from `msw/graphql`.
 * Prefer the root export so Vite never has to resolve `msw/graphql` on 2.x
 * (that subpath does not exist there and fails import analysis).
 */
import * as msw from "msw";

// biome-ignore lint/suspicious/noExplicitAny: dual-major test loader, not a public type
type GraphqlNamespace = any;

const loadGraphqlNamespace = async (): Promise<GraphqlNamespace> => {
  const rootGraphql = (msw as { graphql?: GraphqlNamespace }).graphql;
  if (rootGraphql && typeof rootGraphql.link === "function") {
    return rootGraphql;
  }

  // MSW 3 only. Build the specifier at runtime so Vite/vitest on MSW 2 does not
  // try to resolve the missing `./graphql` export during import analysis.
  const graphqlModuleId = ["msw", "graphql"].join("/");
  const mod = (await import(/* @vite-ignore */ graphqlModuleId)) as {
    graphql?: GraphqlNamespace;
  };
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
