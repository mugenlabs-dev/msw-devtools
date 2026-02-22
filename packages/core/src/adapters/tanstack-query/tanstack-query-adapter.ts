import type { MockChangeType, MswDevToolAdapter } from "../../adapter/types";
import type { QueryClient } from "@tanstack/react-query";

/**
 * Creates a TanStack Query (React Query) adapter for MSW DevTools.
 * When mock configuration changes, it invalidates all queries to trigger refetches.
 */
export function createTanStackQueryAdapter(queryClient: QueryClient): MswDevToolAdapter {
	return {
		id: "tanstack-query",
		onMockUpdate(_operationName: string, _changeType: MockChangeType): void {
			queryClient.invalidateQueries();
		},
	};
}
