import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "/",
  define: {
    "import.meta.env.VERCEL_ENV": JSON.stringify(process.env.VERCEL_ENV ?? ""),
  },
  plugins: [
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
