import { createTanStackQueryAdapter } from "./tanstack-query-adapter";

const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("tanstack query adapter", () => {
  it("returns an adapter with id 'tanstack-query'", () => {
    const queryClient = { resetQueries: vi.fn() };
    const adapter = createTanStackQueryAdapter(
      queryClient as unknown as Parameters<typeof createTanStackQueryAdapter>[0]
    );
    expect(adapter.id).toBe("tanstack-query");
  });

  it("calls queryClient.resetQueries() on mock update", () => {
    const queryClient = { resetQueries: vi.fn() };
    const adapter = createTanStackQueryAdapter(
      queryClient as unknown as Parameters<typeof createTanStackQueryAdapter>[0]
    );

    adapter.onMockUpdate("GetUser", "toggle");
    expect(queryClient.resetQueries).toHaveBeenCalledOnce();
  });

  it("calls resetQueries for every mock update event", () => {
    const queryClient = { resetQueries: vi.fn() };
    const adapter = createTanStackQueryAdapter(
      queryClient as unknown as Parameters<typeof createTanStackQueryAdapter>[0]
    );

    adapter.onMockUpdate("GetUser", "toggle");
    adapter.onMockUpdate("GetPosts", "variant");
    adapter.onMockUpdate("GetUser", "json-override");

    expect(queryClient.resetQueries).toHaveBeenCalledTimes(3);
  });

  it("does not surface a failed reset as an unhandled rejection", async () => {
    const queryClient = { resetQueries: vi.fn().mockRejectedValue(new Error("boom")) };
    const adapter = createTanStackQueryAdapter(
      queryClient as unknown as Parameters<typeof createTanStackQueryAdapter>[0]
    );

    adapter.onMockUpdate("GetUser", "toggle");
    await flushMicrotasks();

    expect(queryClient.resetQueries).toHaveBeenCalledOnce();
  });
});
