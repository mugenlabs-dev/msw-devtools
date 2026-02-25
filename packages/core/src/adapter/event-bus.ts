import type { MockChangeType, MockUpdateEvent } from "./types";

/** @internal */
export const MOCK_UPDATE_EVENT_NAME = "msw-devtool-mock-updated";

declare global {
  interface WindowEventMap {
    [MOCK_UPDATE_EVENT_NAME]: CustomEvent<MockUpdateEvent>;
  }
}

/**
 * @internal — Dispatches a mock update event. Called by the UI when the user
 * changes any mock configuration. Not part of the public API.
 */
export const dispatchMockUpdate = (
  operationName: string,
  changeType: MockChangeType = "toggle"
): void => {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(
    new CustomEvent(MOCK_UPDATE_EVENT_NAME, {
      detail: { changeType, operationName },
    })
  );
};

/**
 * @internal — Subscribes to mock update events. Used by adapters.
 * Returns an unsubscribe function. Not part of the public API.
 */
export const onMockUpdate = (listener: (event: MockUpdateEvent) => void): (() => void) => {
  if (typeof window === "undefined") {
    return () => {
      // No-op unsubscribe — no window means no listener was attached
    };
  }

  const handler = (e: CustomEvent<MockUpdateEvent>) => {
    listener(e.detail);
  };
  window.addEventListener(MOCK_UPDATE_EVENT_NAME, handler as EventListener);
  return () => {
    window.removeEventListener(MOCK_UPDATE_EVENT_NAME, handler as EventListener);
  };
};
