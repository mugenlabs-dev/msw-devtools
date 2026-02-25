import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "/",
  plugins: [
    tailwindcss(),
    tsConfigPaths(),
    tanstackStart({
      pages: [
        {
          path: "/",
          prerender: { enabled: true },
        },
      ],
    }),
    react(),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 3001,
  },
});
