import type { QueryClient } from "@tanstack/react-query";
import { ignoreRejection } from "#/adapter/ignore-rejection";
import type { MockChangeType, MswDevToolAdapter } from "#/adapter/types";

/**
 * Creates a TanStack Query (React Query) adapter for MSW DevTools.
 * When mock configuration changes, it resets every query. Reset drops the
 * cached payload, so a disabled mock is not still painted while the refetch
 * runs or if that refetch fails. Active queries refetch.
 */
export const createTanStackQueryAdapter = (queryClient: QueryClient): MswDevToolAdapter => ({
  id: "tanstack-query",
  onMockUpdate(_operationName: string, _changeType: MockChangeType): void {
    ignoreRejection(queryClient.resetQueries());
  },
});
