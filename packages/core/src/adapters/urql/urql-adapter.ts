import type { MockChangeType, MswDevToolAdapter } from "../../adapter/types";

/**
 * Creates a URQL adapter for MSW DevTools.
 *
 * The actual refetch logic lives in the `mockRefetchExchange` which
 * listens for the same CustomEvent that the adapter system dispatches.
 * This adapter serves as a registration marker.
 */
export function createUrqlAdapter(): MswDevToolAdapter {
	return {
		id: "urql",
		onMockUpdate(_operationName: string, _changeType: MockChangeType): void {
			// The mockRefetchExchange handles refetching by listening to
			// the 'msw-devtool-mock-updated' CustomEvent directly.
		},
	};
}
