import type { MockChangeType, MswDevToolAdapter } from "#/adapter/types";

/**
 * Creates an Axios adapter for MSW DevTools.
 *
 * Axios has no built-in query cache, so this adapter serves as a
 * registration marker. Use `useMockRefetch()` in your components
 * to automatically refetch when mock config changes.
 */
export const createAxiosAdapter = (): MswDevToolAdapter => ({
  id: "axios",
  onMockUpdate(_operationName: string, _changeType: MockChangeType): void {
    // Axios has no query cache to invalidate.
    // Components should use useMockRefetch() for live updates.
  },
});
