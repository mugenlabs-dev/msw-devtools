import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // This app pins MSW 2, which has no `msw/graphql` export.
      "msw/graphql": join(repoRoot, "packages/core/src/test-utils/msw-graphql-shim.ts"),
    },
    dedupe: ["react", "react-dom", "msw"],
  },
  server: {
    port: 3002,
  },
});
