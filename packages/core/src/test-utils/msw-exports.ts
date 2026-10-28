import { createRequire } from "node:module";

/** True when the installed `msw` package exports `./graphql` (MSW 3+). */
export const mswHasGraphqlSubpath = (): boolean => {
  try {
    const require = createRequire(import.meta.url);
    const pkg = require("msw/package.json") as {
      exports?: Record<string, unknown>;
    };
    return pkg.exports?.["./graphql"] != null;
  } catch {
    return false;
  }
};
