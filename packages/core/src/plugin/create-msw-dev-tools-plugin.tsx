import { MswDevToolsPlugin } from "./msw-dev-tools-plugin";

export interface MswDevToolsPluginOptions {
  /** Whether to open the devtools panel by default. Default: true */
  defaultOpen?: boolean;
  /** Plugin display name. Default: 'MSW Mocks' */
  name?: string;
}

/**
 * Creates a TanStack DevTools plugin config object for MSW DevTools.
 *
 * Usage:
 * ```tsx
 * import { TanStackDevtools } from '@tanstack/react-devtools'
 * import { createMswDevToolsPlugin } from 'msw-devtool'
 *
 * <TanStackDevtools plugins={[createMswDevToolsPlugin()]} />
 * ```
 */
export const createMswDevToolsPlugin = (options?: MswDevToolsPluginOptions) => ({
  defaultOpen: options?.defaultOpen ?? true,
  id: "msw-devtools-plugin",
  name: options?.name ?? "MSW Mocks",
  render: <MswDevToolsPlugin />,
});
