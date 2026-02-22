import { MOCK_UPDATE_EVENT_NAME } from "../../adapter/event-bus";
import type { MockUpdateEvent } from "../../adapter/types";
import type { Exchange, Operation } from "@urql/core";
import { makeOperation } from "@urql/core";
import { pipe, tap } from "wonka";

function getOperationName(op: Operation): string | undefined {
	for (const def of op.query.definitions) {
		if (def.kind === "OperationDefinition" && def.name?.value) {
			return def.name.value;
		}
	}
	return undefined;
}

/**
 * URQL exchange that listens for mock update events and re-executes
 * matching active queries with network-only policy.
 *
 * Add to your URQL client's exchange chain:
 * ```ts
 * exchanges: [cacheExchange, mockRefetchExchange, fetchExchange]
 * ```
 */
export const mockRefetchExchange: Exchange = ({ client, forward }) => {
	const activeOps = new Map<number, Operation>();

	if (typeof window !== "undefined") {
		window.addEventListener(MOCK_UPDATE_EVENT_NAME, ((
			event: CustomEvent<MockUpdateEvent>,
		) => {
			const { operationName } = event.detail;

			for (const [, op] of activeOps) {
				if (op.kind !== "query") continue;
				if (getOperationName(op) !== operationName) continue;

				client.reexecuteOperation(
					makeOperation(op.kind, op, {
						...op.context,
						requestPolicy: "network-only",
					}),
				);
			}
		}) as EventListener);
	}

	return (ops$) =>
		pipe(
			ops$,
			tap((op) => {
				if (op.kind === "teardown") {
					activeOps.delete(op.key);
				} else {
					activeOps.set(op.key, op);
				}
			}),
			forward,
		);
};
