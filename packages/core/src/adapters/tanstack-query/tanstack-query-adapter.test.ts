import { describe, it, expect, vi } from "vitest";
import { createTanStackQueryAdapter } from "./tanstack-query-adapter";

describe("createTanStackQueryAdapter", () => {
	it("returns an adapter with id 'tanstack-query'", () => {
		const queryClient = { invalidateQueries: vi.fn() };
		const adapter = createTanStackQueryAdapter(queryClient as any);
		expect(adapter.id).toBe("tanstack-query");
	});

	it("calls queryClient.invalidateQueries() on mock update", () => {
		const queryClient = { invalidateQueries: vi.fn() };
		const adapter = createTanStackQueryAdapter(queryClient as any);

		adapter.onMockUpdate("GetUser", "toggle");
		expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(1);
	});

	it("calls invalidateQueries for every mock update event", () => {
		const queryClient = { invalidateQueries: vi.fn() };
		const adapter = createTanStackQueryAdapter(queryClient as any);

		adapter.onMockUpdate("GetUser", "toggle");
		adapter.onMockUpdate("GetPosts", "variant");
		adapter.onMockUpdate("GetUser", "json-override");

		expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(3);
	});
});
