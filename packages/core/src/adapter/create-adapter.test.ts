import { describe, it, expect, vi, beforeEach } from "vitest";
import type { MswDevToolAdapter } from "./types";

describe("create-adapter", () => {
	let registerAdapter: typeof import("./create-adapter").registerAdapter;
	let getAdapters: typeof import("./create-adapter").getAdapters;
	let dispatchMockUpdate: typeof import("./event-bus").dispatchMockUpdate;

	beforeEach(async () => {
		vi.resetModules();
		const adapterMod = await import("./create-adapter");
		const eventBusMod = await import("./event-bus");
		registerAdapter = adapterMod.registerAdapter;
		getAdapters = adapterMod.getAdapters;
		dispatchMockUpdate = eventBusMod.dispatchMockUpdate;
	});

	it("registers an adapter and it appears in getAdapters", () => {
		const adapter: MswDevToolAdapter = {
			id: "test",
			onMockUpdate: vi.fn(),
		};

		registerAdapter(adapter);
		expect(getAdapters()).toContainEqual(adapter);
	});

	it("calls adapter.setup() on registration", () => {
		const setup = vi.fn();
		const adapter: MswDevToolAdapter = {
			id: "test",
			onMockUpdate: vi.fn(),
			setup,
		};

		registerAdapter(adapter);
		expect(setup).toHaveBeenCalledTimes(1);
	});

	it("forwards mock update events to registered adapter", () => {
		const onMockUpdateFn = vi.fn();
		const adapter: MswDevToolAdapter = {
			id: "test",
			onMockUpdate: onMockUpdateFn,
		};

		registerAdapter(adapter);
		dispatchMockUpdate("GetUser", "toggle");

		expect(onMockUpdateFn).toHaveBeenCalledWith("GetUser", "toggle");
	});

	it("returns an unregister function that removes the adapter", () => {
		const adapter: MswDevToolAdapter = {
			id: "test",
			onMockUpdate: vi.fn(),
		};

		const unregister = registerAdapter(adapter);
		expect(getAdapters()).toHaveLength(1);

		unregister();
		expect(getAdapters()).toHaveLength(0);
	});

	it("calls cleanup from setup() on unregister", () => {
		const cleanup = vi.fn();
		const adapter: MswDevToolAdapter = {
			id: "test",
			onMockUpdate: vi.fn(),
			setup: () => cleanup,
		};

		const unregister = registerAdapter(adapter);
		unregister();
		expect(cleanup).toHaveBeenCalledTimes(1);
	});

	it("stops forwarding events after unregister", () => {
		const onMockUpdateFn = vi.fn();
		const adapter: MswDevToolAdapter = {
			id: "test",
			onMockUpdate: onMockUpdateFn,
		};

		const unregister = registerAdapter(adapter);
		unregister();

		dispatchMockUpdate("GetUser", "toggle");
		expect(onMockUpdateFn).not.toHaveBeenCalled();
	});

	it("supports registering multiple adapters", () => {
		const adapter1: MswDevToolAdapter = { id: "a1", onMockUpdate: vi.fn() };
		const adapter2: MswDevToolAdapter = { id: "a2", onMockUpdate: vi.fn() };

		registerAdapter(adapter1);
		registerAdapter(adapter2);

		expect(getAdapters()).toHaveLength(2);
	});
});
