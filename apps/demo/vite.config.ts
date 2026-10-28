import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

const require = createRequire(import.meta.url);
const mswBrowserEntry = join(dirname(require.resolve("msw/package.json")), "lib/browser/index.js");

/** MSW 3 sets `exports["./browser"].node = null`; SSR resolve fails without this. */
const mswBrowserSsrPlugin = (): Plugin => ({
  enforce: "pre",
  name: "msw-browser-ssr-resolve",
  resolveId(id, _importer, options) {
    if (id === "msw/browser" && options?.ssr) {
      return mswBrowserEntry;
    }
  },
});

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "/",
  plugins: [
    mswBrowserSsrPlugin(),
    tailwindcss(),
    tsConfigPaths(),
    tanstackStart({
      pages: [
        { path: "/", prerender: { enabled: true } },
        { path: "/docs", prerender: { enabled: true } },
        { path: "/developers", prerender: { enabled: true } },
        { path: "/about", prerender: { enabled: true } },
        { path: "/contact", prerender: { enabled: true } },
        { path: "/privacy", prerender: { enabled: true } },
      ],
    }),
    react(),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: Number(process.env.PORT) || 3001,
    proxy: {
      "/ingest": {
        changeOrigin: true,
        rewrite: (path) =>
          path.startsWith("/ingest/static")
            ? path.replace(/^\/ingest\/static/, "/static")
            : path.replace(/^\/ingest/, ""),
        router: (req) =>
          req.url?.includes("/ingest/static")
            ? "https://eu-assets.i.posthog.com"
            : "https://eu.i.posthog.com",
        target: "https://eu.i.posthog.com",
      },
    },
  },
});
