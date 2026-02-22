import type { MswDevToolAdapter, MockUpdateEvent } from "./types";
import { onMockUpdate } from "./event-bus";

const adapters = new Map<
	string,
	{ adapter: MswDevToolAdapter; cleanup?: () => void }
>();

/**
 * Register an adapter with the devtools.
 * The adapter's onMockUpdate will be called whenever mock config changes.
 * Returns an unregister function.
 */
export function registerAdapter(adapter: MswDevToolAdapter): () => void {
	const adapterCleanup = adapter.setup?.();

	const unsubscribe = onMockUpdate((event: MockUpdateEvent) => {
		adapter.onMockUpdate(event.operationName, event.changeType);
	});

	adapters.set(adapter.id, {
		adapter,
		cleanup: () => {
			unsubscribe();
			adapterCleanup?.();
		},
	});

	return () => {
		adapters.get(adapter.id)?.cleanup?.();
		adapters.delete(adapter.id);
	};
}

/** Get all registered adapters. */
export function getAdapters(): MswDevToolAdapter[] {
	return Array.from(adapters.values()).map((a) => a.adapter);
}
