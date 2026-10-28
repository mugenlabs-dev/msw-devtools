import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const appRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(appRoot, "../..");
const demoSrc = join(repoRoot, "apps/demo/src");

export default defineConfig({
  // Deployed under /msw2/ next to the MSW 3 demo so each major owns its SW scope.
  base: "/msw2/",
  build: {
    emptyOutDir: true,
    outDir: join(repoRoot, "apps/demo/dist/client/msw2"),
  },
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "#demo": demoSrc,
      // This app pins MSW 2, which has no `msw/graphql` export.
      "msw/graphql": join(repoRoot, "packages/core/src/test-utils/msw-graphql-shim.ts"),
    },
    dedupe: ["graphql", "msw", "react", "react-dom"],
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
    port: 3002,
  },
});
