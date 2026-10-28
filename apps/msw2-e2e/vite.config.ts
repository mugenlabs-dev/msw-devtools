import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const appRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(appRoot, "../..");

export default defineConfig({
  // Deployed under /msw2/ next to the MSW 3 demo so each major owns its SW scope.
  base: "/msw2/",
  build: {
    emptyOutDir: true,
    outDir: join(repoRoot, "apps/demo/dist/client/msw2"),
  },
  plugins: [react()],
  resolve: {
    alias: {
      "#msw-version-switch": join(repoRoot, "apps/demo/src/components/msw-version-switch.tsx"),
      // This app pins MSW 2, which has no `msw/graphql` export.
      "msw/graphql": join(repoRoot, "packages/core/src/test-utils/msw-graphql-shim.ts"),
    },
    dedupe: ["react", "react-dom", "msw"],
  },
  server: {
    port: 3002,
  },
});
