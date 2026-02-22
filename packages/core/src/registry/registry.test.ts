import { describe, it, expect, beforeEach, vi } from "vitest";
import type { MockOperationDescriptor } from "./types";

// We need a fresh MockRegistry for each test, but the module exports a singleton.
// Re-import to get a fresh module each time.
describe("MockRegistry", () => {
	let mockRegistry: typeof import("./registry").mockRegistry;
	let registerMocks: typeof import("./registry").registerMocks;

	const graphqlDescriptor: MockOperationDescriptor = {
		type: "graphql",
		operationName: "GetUser",
		operationType: "query",
		variants: [{ id: "success", label: "Success", data: { id: 1, name: "Alice" } }],
	};

	const restDescriptor: MockOperationDescriptor = {
		type: "rest",
		operationName: "GET Users",
		method: "get",
		path: "/api/users",
		variants: [{ id: "success", label: "Success (200)", data: [{ id: 1 }], statusCode: 200 }],
	};

	beforeEach(async () => {
		// Reset modules to get a fresh singleton
		vi.resetModules();
		const mod = await import("./registry");
		mockRegistry = mod.mockRegistry;
		registerMocks = mod.registerMocks;
	});

	describe("register", () => {
		it("registers a single descriptor", () => {
			mockRegistry.register(graphqlDescriptor);
			expect(mockRegistry.size).toBe(1);
			expect(mockRegistry.get("GetUser")).toEqual(graphqlDescriptor);
		});

		it("registers multiple descriptors", () => {
			mockRegistry.register(graphqlDescriptor, restDescriptor);
			expect(mockRegistry.size).toBe(2);
		});

		it("overwrites existing descriptor with same operationName", () => {
			const updated = { ...graphqlDescriptor, variants: [] };
			mockRegistry.register(graphqlDescriptor);
			mockRegistry.register(updated);
			expect(mockRegistry.size).toBe(1);
			expect(mockRegistry.get("GetUser")?.variants).toEqual([]);
		});

		it("notifies listeners on register", () => {
			const listener = vi.fn();
			mockRegistry.subscribe(listener);
			mockRegistry.register(graphqlDescriptor);
			expect(listener).toHaveBeenCalledTimes(1);
		});
	});

	describe("unregister", () => {
		it("removes a descriptor by operationName", () => {
			mockRegistry.register(graphqlDescriptor);
			mockRegistry.unregister("GetUser");
			expect(mockRegistry.size).toBe(0);
			expect(mockRegistry.get("GetUser")).toBeUndefined();
		});

		it("notifies listeners on unregister", () => {
			mockRegistry.register(graphqlDescriptor);
			const listener = vi.fn();
			mockRegistry.subscribe(listener);
			mockRegistry.unregister("GetUser");
			expect(listener).toHaveBeenCalledTimes(1);
		});

		it("is safe to unregister non-existent descriptor", () => {
			expect(() => mockRegistry.unregister("NonExistent")).not.toThrow();
		});
	});

	describe("getAll", () => {
		it("returns empty array when no descriptors registered", () => {
			expect(mockRegistry.getAll()).toEqual([]);
		});

		it("returns all registered descriptors", () => {
			mockRegistry.register(graphqlDescriptor, restDescriptor);
			const all = mockRegistry.getAll();
			expect(all).toHaveLength(2);
			expect(all).toContainEqual(graphqlDescriptor);
			expect(all).toContainEqual(restDescriptor);
		});

		it("returns a stable reference (cached snapshot)", () => {
			mockRegistry.register(graphqlDescriptor);
			const first = mockRegistry.getAll();
			const second = mockRegistry.getAll();
			expect(first).toBe(second);
		});

		it("returns a new reference after mutation", () => {
			mockRegistry.register(graphqlDescriptor);
			const first = mockRegistry.getAll();
			mockRegistry.register(restDescriptor);
			const second = mockRegistry.getAll();
			expect(first).not.toBe(second);
		});
	});

	describe("get", () => {
		it("returns undefined for non-existent descriptor", () => {
			expect(mockRegistry.get("NonExistent")).toBeUndefined();
		});

		it("returns the correct descriptor", () => {
			mockRegistry.register(graphqlDescriptor, restDescriptor);
			expect(mockRegistry.get("GetUser")).toEqual(graphqlDescriptor);
			expect(mockRegistry.get("GET Users")).toEqual(restDescriptor);
		});
	});

	describe("subscribe", () => {
		it("returns an unsubscribe function", () => {
			const listener = vi.fn();
			const unsub = mockRegistry.subscribe(listener);
			mockRegistry.register(graphqlDescriptor);
			expect(listener).toHaveBeenCalledTimes(1);

			unsub();
			mockRegistry.register(restDescriptor);
			expect(listener).toHaveBeenCalledTimes(1); // not called again
		});

		it("supports multiple listeners", () => {
			const listener1 = vi.fn();
			const listener2 = vi.fn();
			mockRegistry.subscribe(listener1);
			mockRegistry.subscribe(listener2);

			mockRegistry.register(graphqlDescriptor);
			expect(listener1).toHaveBeenCalledTimes(1);
			expect(listener2).toHaveBeenCalledTimes(1);
		});
	});

	describe("size", () => {
		it("returns 0 for empty registry", () => {
			expect(mockRegistry.size).toBe(0);
		});

		it("reflects current descriptor count", () => {
			mockRegistry.register(graphqlDescriptor);
			expect(mockRegistry.size).toBe(1);
			mockRegistry.register(restDescriptor);
			expect(mockRegistry.size).toBe(2);
			mockRegistry.unregister("GetUser");
			expect(mockRegistry.size).toBe(1);
		});
	});

	describe("registerMocks", () => {
		it("is a convenience function that delegates to mockRegistry.register", () => {
			registerMocks(graphqlDescriptor, restDescriptor);
			expect(mockRegistry.size).toBe(2);
			expect(mockRegistry.get("GetUser")).toEqual(graphqlDescriptor);
		});
	});
});
