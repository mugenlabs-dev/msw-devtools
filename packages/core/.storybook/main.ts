import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import { mswHasGraphqlSubpath } from "../src/test-utils/msw-exports.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");

const config: StorybookConfig = {
  addons: ["@storybook/addon-vitest"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  stories: ["../src/**/*.stories.tsx"],
  viteFinal: (viteConfig) => {
    viteConfig.resolve ??= {};
    const aliases: Array<{ find: string; replacement: string }> = [
      {
        find: "#/msw/worker-manager",
        replacement: join(packageRoot, ".storybook/mocks/worker-manager.ts"),
      },
      { find: "#", replacement: join(packageRoot, "src") },
    ];
    // MSW 2 has no `msw/graphql`; alias to the root re-export so stories load.
    if (!mswHasGraphqlSubpath()) {
      aliases.unshift({
        find: "msw/graphql",
        replacement: join(packageRoot, "src/test-utils/msw-graphql-shim.ts"),
      });
    }
    viteConfig.resolve.alias = aliases;
    // In monorepo setups, keep root as monorepo root (not package root)
    // to ensure story file resolution works correctly with Vitest
    viteConfig.root = process.cwd();
    return viteConfig;
  },
};

export default config;
