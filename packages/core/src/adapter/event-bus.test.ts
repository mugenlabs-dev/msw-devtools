import { describe, it, expect, vi, beforeEach } from "vitest";

describe("event-bus", () => {
	let dispatchMockUpdate: typeof import("./event-bus").dispatchMockUpdate;
	let onMockUpdate: typeof import("./event-bus").onMockUpdate;
	let MOCK_UPDATE_EVENT_NAME: string;

	beforeEach(async () => {
		vi.resetModules();
		const mod = await import("./event-bus");
		dispatchMockUpdate = mod.dispatchMockUpdate;
		onMockUpdate = mod.onMockUpdate;
		MOCK_UPDATE_EVENT_NAME = mod.MOCK_UPDATE_EVENT_NAME;
	});

	it("exports the correct event name", () => {
		expect(MOCK_UPDATE_EVENT_NAME).toBe("msw-devtool-mock-updated");
	});

	describe("dispatchMockUpdate", () => {
		it("dispatches a CustomEvent on window", () => {
			const handler = vi.fn();
			window.addEventListener("msw-devtool-mock-updated", handler);

			dispatchMockUpdate("GetUser", "toggle");

			expect(handler).toHaveBeenCalledTimes(1);
			const event = handler.mock.calls[0][0] as CustomEvent;
			expect(event.detail).toEqual({
				operationName: "GetUser",
				changeType: "toggle",
			});

			window.removeEventListener("msw-devtool-mock-updated", handler);
		});

		it("defaults changeType to 'toggle'", () => {
			const handler = vi.fn();
			window.addEventListener("msw-devtool-mock-updated", handler);

			dispatchMockUpdate("GetUser");

			const event = handler.mock.calls[0][0] as CustomEvent;
			expect(event.detail.changeType).toBe("toggle");

			window.removeEventListener("msw-devtool-mock-updated", handler);
		});
	});

	describe("onMockUpdate", () => {
		it("subscribes to mock update events", () => {
			const callback = vi.fn();
			const unsub = onMockUpdate(callback);

			dispatchMockUpdate("GetUser", "variant");

			expect(callback).toHaveBeenCalledTimes(1);
			expect(callback).toHaveBeenCalledWith({
				operationName: "GetUser",
				changeType: "variant",
			});

			unsub();
		});

		it("returns an unsubscribe function", () => {
			const callback = vi.fn();
			const unsub = onMockUpdate(callback);

			dispatchMockUpdate("GetUser", "toggle");
			expect(callback).toHaveBeenCalledTimes(1);

			unsub();
			dispatchMockUpdate("GetUser", "toggle");
			expect(callback).toHaveBeenCalledTimes(1); // not called again
		});

		it("supports multiple subscribers", () => {
			const cb1 = vi.fn();
			const cb2 = vi.fn();
			const unsub1 = onMockUpdate(cb1);
			const unsub2 = onMockUpdate(cb2);

			dispatchMockUpdate("GetUser", "toggle");

			expect(cb1).toHaveBeenCalledTimes(1);
			expect(cb2).toHaveBeenCalledTimes(1);

			unsub1();
			unsub2();
		});
	});
});
