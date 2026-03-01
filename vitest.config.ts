import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "#": new URL("packages/core/src", import.meta.url).pathname,
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          globals: true,
          include: ["packages/**/src/**/*.test.ts", "packages/**/src/**/*.test.tsx"],
          setupFiles: [],
        },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir: "./packages/core/.storybook" })],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: "chromium" }],
          },
          setupFiles: ["./packages/core/.storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
