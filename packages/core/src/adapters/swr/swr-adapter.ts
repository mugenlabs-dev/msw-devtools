import type { MockChangeType, MswDevToolAdapter } from "../../adapter/types";

type SWRMutateFn = (
	matcher: (key: string) => boolean,
	data?: unknown,
	opts?: { revalidate: boolean },
) => Promise<unknown>;

/**
 * Creates an SWR adapter for MSW DevTools.
 * When mock configuration changes, it revalidates all SWR cache entries.
 *
 * @param mutate - The global `mutate` function from `swr`.
 */
export function createSwrAdapter(mutate: SWRMutateFn): MswDevToolAdapter {
	return {
		id: "swr",
		onMockUpdate(_operationName: string, _changeType: MockChangeType): void {
			mutate(() => true, undefined, { revalidate: true });
		},
	};
}
