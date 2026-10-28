import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    "adapters/apollo": "src/adapters/apollo/index.ts",
    "adapters/axios": "src/adapters/axios/index.ts",
    "adapters/rtk-query": "src/adapters/rtk-query/index.ts",
    "adapters/swr": "src/adapters/swr/index.ts",
    "adapters/tanstack-query": "src/adapters/tanstack-query/index.ts",
    "adapters/urql": "src/adapters/urql/index.ts",
    index: "src/index.ts",
    persistence: "src/store/persistence-key.ts",
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
  minify: true,
  outExtension: () => ({ js: ".mjs" }),
  plugins: [
    {
      // Mark the React entry as a client module for React Server Components.
      // Only that file: the adapters and the chunks they share with the root
      // stay importable from server code.
      name: "use-client-banner",
      renderChunk(code, chunk) {
        return chunk.path.endsWith("/index.mjs") ? { code: `"use client";\n${code}` } : undefined;
      },
    },
  ],
  sourcemap: false,
});
