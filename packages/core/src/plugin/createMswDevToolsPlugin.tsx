import { MswDevToolsPlugin } from "./MswDevToolsPlugin";

export type MswDevToolsPluginOptions = {
	/** Plugin display name. Default: 'MSW Mocks' */
	name?: string;
	/** Whether to open the devtools panel by default. Default: true */
	defaultOpen?: boolean;
};

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
export function createMswDevToolsPlugin(options?: MswDevToolsPluginOptions) {
	return {
		id: "msw-devtool",
		name: options?.name ?? "MSW Mocks",
		defaultOpen: options?.defaultOpen ?? true,
		render: <MswDevToolsPlugin />,
	};
}
