import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    "adapters/apollo": "src/adapters/apollo/index.ts",
    "adapters/axios": "src/adapters/axios/index.ts",
    "adapters/swr": "src/adapters/swr/index.ts",
    "adapters/tanstack-query": "src/adapters/tanstack-query/index.ts",
    "adapters/urql": "src/adapters/urql/index.ts",
    index: "src/index.ts",
    types: "src/types.ts",
  },
  esbuildOptions(options) {
    options.alias = {
      "#": `${import.meta.dirname}/src`,
    };
  },
  external: [
    "react",
    "react-dom",
    "msw",
    "zustand",
    "@tanstack/pacer",
    "@urql/core",
    "wonka",
    "@tanstack/react-query",
    "swr",
    "@apollo/client",
    "graphql",
  ],
  format: ["esm"],
  outExtension: () => ({ js: ".mjs" }),
  sourcemap: true,
});
