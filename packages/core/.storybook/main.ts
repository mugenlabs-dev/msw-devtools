import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, "..");

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.tsx"],
  addons: ["@storybook/addon-vitest"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: (viteConfig) => {
    viteConfig.resolve ??= {};
    viteConfig.resolve.alias = [
      {
        find: "#/msw/worker-manager",
        replacement: join(packageRoot, ".storybook/mocks/worker-manager.ts"),
      },
      { find: "#", replacement: join(packageRoot, "src") },
    ];
    // In monorepo setups, keep root as monorepo root (not package root)
    // to ensure story file resolution works correctly with Vitest
    viteConfig.root = process.cwd();
    return viteConfig;
  },
};

export default config;
