/**
 * MSW 2 has no `msw/graphql` export. Vitest/Storybook/Vite alias that
 * specifier here so import analysis never fails on a missing subpath.
 */
import * as msw from "msw";

// biome-ignore lint/suspicious/noExplicitAny: dual-major shim, not a public type
const { graphql } = msw as any;

export { graphql };
