export interface MswDevToolAdapter {
  /** Unique identifier for this adapter (e.g., 'urql', 'apollo', 'swr'). */
  id: string;

  /**
   * Called when a mock configuration changes for an operation.
   * The adapter should trigger the client to refetch the affected operation.
   */
  onMockUpdate: (operationName: string, changeType: MockChangeType) => void;

  /**
   * Called once when the adapter is attached to the devtools.
   * Use for setup (e.g., adding event listeners).
   * Returns a cleanup function.
   */
  setup?: () => (() => void) | undefined;
}

export type MockChangeType =
  | "toggle"
  | "variant"
  | "json-override"
  | "status-override"
  | "headers-override"
  | "delay-override"
  | "error-override"
  | "enable-all"
  | "disable-all";

/**
 * Sentinel `operationName` used by bulk events (`enable-all` / `disable-all`),
 * which affect every registered operation at once.
 */
export const ALL_OPERATIONS = "*";

export interface MockUpdateEvent {
  changeType: MockChangeType;
  /** The affected operation, or {@link ALL_OPERATIONS} for bulk changes. */
  operationName: string;
}

/** Whether a mock update event applies to the given operation. */
export const affectsOperation = (event: MockUpdateEvent, operationName: string): boolean =>
  event.operationName === ALL_OPERATIONS || event.operationName === operationName;
