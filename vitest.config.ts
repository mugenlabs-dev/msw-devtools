import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";
import { mswHasGraphqlSubpath } from "./packages/core/src/test-utils/msw-exports";

const mswGraphqlShim = new URL("packages/core/src/test-utils/msw-graphql-shim.ts", import.meta.url)
  .pathname;

/** On MSW 2, map the missing subpath so Vite/Storybook import analysis succeeds. */
const mswGraphqlAlias = mswHasGraphqlSubpath() ? {} : { "msw/graphql": mswGraphqlShim };

export default defineConfig({
  resolve: {
    alias: {
      "#": new URL("packages/core/src", import.meta.url).pathname,
      ...mswGraphqlAlias,
    },
  },
  test: {
    coverage: {
      exclude: ["**/*.stories.tsx", "**/*.test.{ts,tsx}", "**/index.ts"],
      include: ["packages/core/src/**/*.{ts,tsx}"],
      provider: "v8",
      reporter: ["text-summary", "html"],
      // Floors just under the combined unit + Storybook coverage, so CI fails
      // if a change drops it noticeably.
      thresholds: { branches: 85, functions: 88, lines: 90, statements: 90 },
    },
    projects: [
      {
        extends: true,
        resolve: {
          // MSW 3 sets `msw/browser` to `node: null`. Alias it for Node unit tests
          // so `vi.mock("msw/browser")` and dynamic imports still resolve.
          alias: {
            "msw/browser": new URL(
              "packages/core/src/test-utils/msw-browser-stub.ts",
              import.meta.url
            ).pathname,
            ...mswGraphqlAlias,
          },
        },
        test: {
          environment: "jsdom",
          globals: true,
          include: ["packages/**/src/**/*.test.ts", "packages/**/src/**/*.test.tsx"],
          name: "unit",
          setupFiles: [],
        },
      },
      {
        extends: true,
        optimizeDeps: {
          exclude: ["react-dom/test-utils"],
          include: ["@storybook/addon-vitest/internal/test-utils"],
        },
        plugins: [storybookTest({ configDir: "./packages/core/.storybook" })],
        resolve: {
          alias: {
            ...mswGraphqlAlias,
          },
        },
        test: {
          browser: {
            enabled: true,
            headless: true,
            instances: [{ browser: "chromium" }],
            provider: playwright(),
          },
          name: "storybook",
          setupFiles: ["./packages/core/.storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
