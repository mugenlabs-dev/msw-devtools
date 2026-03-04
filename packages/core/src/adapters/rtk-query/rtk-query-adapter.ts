import type { MockChangeType, MswDevToolAdapter } from "#/adapter/types";

interface RtkQueryApi {
  util: {
    resetApiState: () => unknown;
  };
}

interface ReduxStore {
  dispatch: (action: unknown) => unknown;
}

/**
 * Creates an RTK Query adapter for MSW DevTools.
 * When mock configuration changes, it resets the API state to trigger refetches
 * for all active subscriptions.
 */
export const createRtkQueryAdapter = (store: ReduxStore, api: RtkQueryApi): MswDevToolAdapter => ({
  id: "rtk-query",
  onMockUpdate(_operationName: string, _changeType: MockChangeType): void {
    store.dispatch(api.util.resetApiState());
  },
});
