import type { QueryClient } from "@tanstack/react-query";
import type { MockChangeType, MswDevToolAdapter } from "#/adapter/types";

/**
 * Creates a TanStack Query (React Query) adapter for MSW DevTools.
 * When mock configuration changes, it invalidates all queries to trigger refetches.
 */
export const createTanStackQueryAdapter = (queryClient: QueryClient): MswDevToolAdapter => ({
  id: "tanstack-query",
  onMockUpdate(_operationName: string, _changeType: MockChangeType): void {
    void queryClient.invalidateQueries();
  },
});
