export interface MswDevToolAdapter {
	/** Unique identifier for this adapter (e.g., 'urql', 'apollo', 'swr'). */
	id: string;

	/**
	 * Called when a mock configuration changes for an operation.
	 * The adapter should trigger the client to refetch the affected operation.
	 */
	onMockUpdate(operationName: string, changeType: MockChangeType): void;

	/**
	 * Called once when the adapter is attached to the devtools.
	 * Use for setup (e.g., adding event listeners).
	 * Returns a cleanup function.
	 */
	setup?(): (() => void) | void;
}

export type MockChangeType =
	| "toggle"
	| "variant"
	| "json-override"
	| "enable-all"
	| "disable-all";

export type MockUpdateEvent = {
	operationName: string;
	changeType: MockChangeType;
};
