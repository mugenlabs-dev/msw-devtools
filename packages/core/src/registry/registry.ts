import type { MockOperationDescriptor } from "./types";

class MockRegistry {
	private descriptors: Map<string, MockOperationDescriptor> = new Map();
	private listeners: Set<() => void> = new Set();
	private snapshot: MockOperationDescriptor[] = [];

	/** Register one or more descriptors. Overwrites if operationName already exists. */
	register(...descriptors: MockOperationDescriptor[]): void {
		for (const d of descriptors) {
			this.descriptors.set(d.operationName, d);
		}
		this.snapshot = Array.from(this.descriptors.values());
		this.notify();
	}

	/** Remove a descriptor by operationName. */
	unregister(operationName: string): void {
		this.descriptors.delete(operationName);
		this.snapshot = Array.from(this.descriptors.values());
		this.notify();
	}

	/** Get all registered descriptors as a cached array. Safe for useSyncExternalStore. */
	getAll(): MockOperationDescriptor[] {
		return this.snapshot;
	}

	/** Get a single descriptor by operationName. */
	get(operationName: string): MockOperationDescriptor | undefined {
		return this.descriptors.get(operationName);
	}

	/** Subscribe to registry changes. Returns unsubscribe fn. */
	subscribe(listener: () => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	get size(): number {
		return this.descriptors.size;
	}

	private notify(): void {
		for (const listener of this.listeners) {
			listener();
		}
	}
}

/** Singleton registry instance. */
export const mockRegistry = new MockRegistry();

/** Convenience function to register mock descriptors. */
export function registerMocks(
	...descriptors: MockOperationDescriptor[]
): void {
	mockRegistry.register(...descriptors);
}
