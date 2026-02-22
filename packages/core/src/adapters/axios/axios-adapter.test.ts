import { describe, it, expect } from "vitest";
import { createAxiosAdapter } from "./axios-adapter";

describe("createAxiosAdapter", () => {
	it("returns an adapter with id 'axios'", () => {
		const adapter = createAxiosAdapter();
		expect(adapter.id).toBe("axios");
	});

	it("has onMockUpdate that is a no-op (does not throw)", () => {
		const adapter = createAxiosAdapter();
		expect(() => adapter.onMockUpdate("GetUser", "toggle")).not.toThrow();
	});

	it("does not have a setup function", () => {
		const adapter = createAxiosAdapter();
		expect(adapter.setup).toBeUndefined();
	});
});
