import { createTanStackQueryAdapter } from "./tanstack-query-adapter";

const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("tanstack query adapter", () => {
  it("returns an adapter with id 'tanstack-query'", () => {
    const queryClient = { invalidateQueries: vi.fn() };
    const adapter = createTanStackQueryAdapter(
      queryClient as unknown as Parameters<typeof createTanStackQueryAdapter>[0]
    );
    expect(adapter.id).toBe("tanstack-query");
  });

  it("calls queryClient.invalidateQueries() on mock update", () => {
    const queryClient = { invalidateQueries: vi.fn() };
    const adapter = createTanStackQueryAdapter(
      queryClient as unknown as Parameters<typeof createTanStackQueryAdapter>[0]
    );

    adapter.onMockUpdate("GetUser", "toggle");
    expect(queryClient.invalidateQueries).toHaveBeenCalledOnce();
  });

  it("calls invalidateQueries for every mock update event", () => {
    const queryClient = { invalidateQueries: vi.fn() };
    const adapter = createTanStackQueryAdapter(
      queryClient as unknown as Parameters<typeof createTanStackQueryAdapter>[0]
    );

    adapter.onMockUpdate("GetUser", "toggle");
    adapter.onMockUpdate("GetPosts", "variant");
    adapter.onMockUpdate("GetUser", "json-override");

    expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(3);
  });

  it("does not surface a failed invalidation as an unhandled rejection", async () => {
    const queryClient = { invalidateQueries: vi.fn().mockRejectedValue(new Error("boom")) };
    const adapter = createTanStackQueryAdapter(
      queryClient as unknown as Parameters<typeof createTanStackQueryAdapter>[0]
    );

    adapter.onMockUpdate("GetUser", "toggle");
    await flushMicrotasks();

    expect(queryClient.invalidateQueries).toHaveBeenCalledOnce();
  });
});
