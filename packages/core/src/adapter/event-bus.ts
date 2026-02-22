import type { MockChangeType, MockUpdateEvent } from "./types";

export const MOCK_UPDATE_EVENT_NAME = "msw-devtool-mock-updated";

declare global {
	interface WindowEventMap {
		[MOCK_UPDATE_EVENT_NAME]: CustomEvent<MockUpdateEvent>;
	}
}

/**
 * Dispatches a mock update event. Called by the UI when the user
 * changes any mock configuration.
 */
export function dispatchMockUpdate(
	operationName: string,
	changeType: MockChangeType = "toggle",
): void {
	if (typeof window === "undefined") return;
	window.dispatchEvent(
		new CustomEvent(MOCK_UPDATE_EVENT_NAME, {
			detail: { operationName, changeType },
		}),
	);
}

/**
 * Subscribes to mock update events. Used by adapters.
 * Returns an unsubscribe function.
 */
export function onMockUpdate(
	callback: (event: MockUpdateEvent) => void,
): () => void {
	if (typeof window === "undefined") return () => {};

	const handler = (e: CustomEvent<MockUpdateEvent>) => callback(e.detail);
	window.addEventListener(
		MOCK_UPDATE_EVENT_NAME,
		handler as EventListener,
	);
	return () =>
		window.removeEventListener(
			MOCK_UPDATE_EVENT_NAME,
			handler as EventListener,
		);
}
