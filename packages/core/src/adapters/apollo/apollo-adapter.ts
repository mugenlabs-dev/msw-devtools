import type { MockChangeType, MswDevToolAdapter } from "../../adapter/types";
import type { ApolloClient } from "@apollo/client";

/**
 * Creates an Apollo Client adapter for MSW DevTools.
 * When mock configuration changes, it refetches all active queries.
 */
export function createApolloAdapter(client: ApolloClient<unknown>): MswDevToolAdapter {
	return {
		id: "apollo",
		onMockUpdate(_operationName: string, _changeType: MockChangeType): void {
			client.refetchQueries({ include: "active" });
		},
	};
}
