import { onMockUpdate } from "./event-bus";
import type { MockUpdateEvent, MswDevToolAdapter } from "./types";

const adapters = new Map<string, { adapter: MswDevToolAdapter; cleanup?: () => void }>();

/**
 * Register an adapter with the devtools.
 * The adapter's onMockUpdate will be called whenever mock config changes.
 * Returns an unregister function.
 */
export const registerAdapter = (adapter: MswDevToolAdapter): (() => void) => {
  // Clean up any existing adapter registered under the same id so its
  // onMockUpdate listener (and setup cleanup) isn't leaked on overwrite.
  adapters.get(adapter.id)?.cleanup?.();

  const adapterCleanup = adapter.setup?.();

  const unsubscribe = onMockUpdate((event: MockUpdateEvent) => {
    adapter.onMockUpdate(event.operationName, event.changeType);
  });

  const entry = {
    adapter,
    cleanup: () => {
      unsubscribe();
      adapterCleanup?.();
    },
  };
  adapters.set(adapter.id, entry);

  return () => {
    // Only tear down the adapter this call registered. If the id has since
    // been re-registered, the newer adapter stays live.
    if (adapters.get(adapter.id) !== entry) {
      return;
    }
    entry.cleanup();
    adapters.delete(adapter.id);
  };
};

/** @internal — Get all registered adapters. Not part of the public API. */
export const getAdapters = (): MswDevToolAdapter[] => [...adapters.values()].map((a) => a.adapter);
