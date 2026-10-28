/**
 * MSW 2 has no `msw/graphql` export. Vitest/Storybook/Vite alias that
 * specifier here so import analysis never fails on a missing subpath.
 */
// biome-ignore lint/performance/noNamespaceImport: root graphql exists only on MSW 2
import * as msw from "msw";

// biome-ignore lint/suspicious/noExplicitAny: dual-major shim, not a public type
const { graphql } = msw as any;

export { graphql };
