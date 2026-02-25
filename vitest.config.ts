import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "#": new URL("packages/core/src", import.meta.url).pathname,
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["packages/**/src/**/*.test.ts", "packages/**/src/**/*.test.tsx"],
    setupFiles: [],
  },
});
