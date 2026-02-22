import { describe, it, expect, beforeEach, vi } from "vitest";
import { useMockStore } from "./store";

describe("MockStore", () => {
	beforeEach(() => {
		// Reset store state between tests
		useMockStore.setState({
			operations: {},
			workerStatus: "idle",
			seenOperations: new Set(),
		});
	});

	describe("setEnabled", () => {
		it("sets enabled state for an operation", () => {
			const { setEnabled } = useMockStore.getState();
			setEnabled("GetUser", true);

			const { operations } = useMockStore.getState();
			expect(operations.GetUser.enabled).toBe(true);
		});

		it("toggles enabled state", () => {
			const store = useMockStore.getState();
			store.setEnabled("GetUser", true);
			expect(useMockStore.getState().operations.GetUser.enabled).toBe(true);

			useMockStore.getState().setEnabled("GetUser", false);
			expect(useMockStore.getState().operations.GetUser.enabled).toBe(false);
		});
	});

	describe("setActiveVariant", () => {
		it("sets the active variant for an operation", () => {
			useMockStore.getState().setActiveVariant("GetUser", "error");
			expect(useMockStore.getState().operations.GetUser.activeVariantId).toBe("error");
		});

		it("resets customJsonOverride when changing variant", () => {
			useMockStore.getState().setCustomJsonOverride("GetUser", '{"test":true}');
			useMockStore.getState().setActiveVariant("GetUser", "error");
			expect(useMockStore.getState().operations.GetUser.customJsonOverride).toBeNull();
		});

		it("resets statusCode when changing variant", () => {
			useMockStore.getState().setStatusCode("GetUser", 404);
			useMockStore.getState().setActiveVariant("GetUser", "error");
			expect(useMockStore.getState().operations.GetUser.statusCode).toBeNull();
		});

		it("resets customHeaders when changing variant", () => {
			useMockStore.getState().setCustomHeaders("GetUser", '{"X-Test":"1"}');
			useMockStore.getState().setActiveVariant("GetUser", "error");
			expect(useMockStore.getState().operations.GetUser.customHeaders).toBeNull();
		});
	});

	describe("setCustomJsonOverride", () => {
		it("sets custom JSON override", () => {
			const json = '{"id":1,"name":"Alice"}';
			useMockStore.getState().setCustomJsonOverride("GetUser", json);
			expect(useMockStore.getState().operations.GetUser.customJsonOverride).toBe(json);
		});

		it("can be cleared by setting null", () => {
			useMockStore.getState().setCustomJsonOverride("GetUser", '{"test":true}');
			useMockStore.getState().setCustomJsonOverride("GetUser", null);
			expect(useMockStore.getState().operations.GetUser.customJsonOverride).toBeNull();
		});
	});

	describe("setDelay", () => {
		it("sets delay for an operation", () => {
			useMockStore.getState().setDelay("GetUser", 500);
			expect(useMockStore.getState().operations.GetUser.delay).toBe(500);
		});

		it("clamps negative values to 0", () => {
			useMockStore.getState().setDelay("GetUser", -100);
			expect(useMockStore.getState().operations.GetUser.delay).toBe(0);
		});
	});

	describe("setStatusCode", () => {
		it("sets status code override", () => {
			useMockStore.getState().setStatusCode("GetUser", 404);
			expect(useMockStore.getState().operations.GetUser.statusCode).toBe(404);
		});

		it("can be cleared by setting null", () => {
			useMockStore.getState().setStatusCode("GetUser", 500);
			useMockStore.getState().setStatusCode("GetUser", null);
			expect(useMockStore.getState().operations.GetUser.statusCode).toBeNull();
		});
	});

	describe("setCustomHeaders", () => {
		it("sets custom headers JSON string", () => {
			const headers = '{"Content-Type":"application/xml"}';
			useMockStore.getState().setCustomHeaders("GetUser", headers);
			expect(useMockStore.getState().operations.GetUser.customHeaders).toBe(headers);
		});

		it("can be cleared by setting null", () => {
			useMockStore.getState().setCustomHeaders("GetUser", '{"X-Test":"1"}');
			useMockStore.getState().setCustomHeaders("GetUser", null);
			expect(useMockStore.getState().operations.GetUser.customHeaders).toBeNull();
		});
	});

	describe("enableAll / disableAll", () => {
		beforeEach(() => {
			// Set up multiple operations
			useMockStore.getState().setEnabled("Op1", false);
			useMockStore.getState().setEnabled("Op2", false);
			useMockStore.getState().setEnabled("Op3", true);
		});

		it("enableAll sets all operations to enabled", () => {
			useMockStore.getState().enableAll();
			const { operations } = useMockStore.getState();
			expect(operations.Op1.enabled).toBe(true);
			expect(operations.Op2.enabled).toBe(true);
			expect(operations.Op3.enabled).toBe(true);
		});

		it("disableAll sets all operations to disabled", () => {
			useMockStore.getState().disableAll();
			const { operations } = useMockStore.getState();
			expect(operations.Op1.enabled).toBe(false);
			expect(operations.Op2.enabled).toBe(false);
			expect(operations.Op3.enabled).toBe(false);
		});
	});

	describe("workerStatus", () => {
		it("defaults to idle", () => {
			expect(useMockStore.getState().workerStatus).toBe("idle");
		});

		it("can be set to any status", () => {
			useMockStore.getState().setWorkerStatus("active");
			expect(useMockStore.getState().workerStatus).toBe("active");

			useMockStore.getState().setWorkerStatus("error");
			expect(useMockStore.getState().workerStatus).toBe("error");
		});
	});

	describe("seenOperations", () => {
		it("defaults to empty set", () => {
			expect(useMockStore.getState().seenOperations.size).toBe(0);
		});

		it("markOperationSeen adds operation to the set", () => {
			useMockStore.getState().markOperationSeen("GetUser");
			expect(useMockStore.getState().seenOperations.has("GetUser")).toBe(true);
		});

		it("markOperationSeen is idempotent", () => {
			useMockStore.getState().markOperationSeen("GetUser");
			useMockStore.getState().markOperationSeen("GetUser");
			expect(useMockStore.getState().seenOperations.size).toBe(1);
		});

		it("clearSeenOperations resets the set", () => {
			useMockStore.getState().markOperationSeen("Op1");
			useMockStore.getState().markOperationSeen("Op2");
			useMockStore.getState().clearSeenOperations();
			expect(useMockStore.getState().seenOperations.size).toBe(0);
		});
	});

	describe("syncWithRegistry", () => {
		it("adds default config for new operations", () => {
			useMockStore.getState().syncWithRegistry(["GetUser", "GetPosts"]);
			const { operations } = useMockStore.getState();
			expect(operations.GetUser).toBeDefined();
			expect(operations.GetPosts).toBeDefined();
			expect(operations.GetUser.enabled).toBe(false);
			expect(operations.GetUser.activeVariantId).toBe("success");
			expect(operations.GetUser.delay).toBe(0);
		});

		it("preserves existing operation config", () => {
			useMockStore.getState().setEnabled("GetUser", true);
			useMockStore.getState().setDelay("GetUser", 500);

			useMockStore.getState().syncWithRegistry(["GetUser", "GetPosts"]);
			const { operations } = useMockStore.getState();
			expect(operations.GetUser.enabled).toBe(true);
			expect(operations.GetUser.delay).toBe(500);
		});

		it("removes operations not in the registry", () => {
			useMockStore.getState().setEnabled("GetUser", true);
			useMockStore.getState().setEnabled("GetPosts", true);

			useMockStore.getState().syncWithRegistry(["GetUser"]);
			const { operations } = useMockStore.getState();
			expect(operations.GetUser).toBeDefined();
			expect(operations.GetPosts).toBeUndefined();
		});
	});
});
