import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const require = createRequire(import.meta.url);

type ExportTarget = string | null | { [condition: string]: ExportTarget };

/** First file path in an `exports` entry, following browser/import/default conditions. */
const pickExport = (target: ExportTarget | undefined): string | undefined => {
  if (typeof target === "string") {
    return target;
  }
  if (target === null || target === undefined) {
    return undefined;
  }
  for (const condition of ["browser", "import", "default"]) {
    const path = pickExport(target[condition]);
    if (path) {
      return path;
    }
  }
  return undefined;
};

/** Read msw's own exports map, so a moved file fails here, by name, at config load. */
const resolveMswBrowserEntry = (): string => {
  const pkgPath = require.resolve("msw/package.json");
  const { exports } = require(pkgPath) as { exports?: Record<string, ExportTarget> };
  const entry = pickExport(exports?.["./browser"]);
  if (!entry) {
    throw new Error('msw-browser-ssr-resolve: msw has no browser build for "msw/browser"');
  }
  return join(dirname(pkgPath), entry);
};

const mswBrowserEntry = resolveMswBrowserEntry();

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
    tsconfigPaths: true,
  },
  server: {
    port: Number(process.env.PORT) || 3001,
    proxy: {
      "/ingest": {
        changeOrigin: true,
        rewrite: (path) =>
          path.startsWith("/ingest/static")
            ? path.replace(/^\/ingest\/static/u, "/static")
            : path.replace(/^\/ingest/u, ""),
        router: (req) =>
          req.url?.includes("/ingest/static")
            ? "https://eu-assets.i.posthog.com"
            : "https://eu.i.posthog.com",
        target: "https://eu.i.posthog.com",
      },
      // The MSW 2 playground is a separate app (apps/msw2-e2e). Vercel routes /msw2/ to it in
      // production; in dev, `pnpm dev:demo` starts it and this forwards to it.
      "/msw2": {
        target: process.env.MSW2_DEV_URL ?? "http://localhost:3003",
        ws: true,
      },
    },
  },
});
