import type { ApolloClient } from "@apollo/client";
import type { MockChangeType, MswDevToolAdapter } from "#/adapter/types";

/**
 * Creates an Apollo Client adapter for MSW DevTools.
 * When mock configuration changes, it refetches all active queries.
 */
export const createApolloAdapter = (client: ApolloClient<unknown>): MswDevToolAdapter => ({
  id: "apollo",
  onMockUpdate(_operationName: string, _changeType: MockChangeType): void {
    void client.refetchQueries({ include: "active" });
  },
});
