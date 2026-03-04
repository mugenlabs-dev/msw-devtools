import { createRtkQueryAdapter } from "./rtk-query-adapter";

describe("rtk query adapter", () => {
  it("returns an adapter with id 'rtk-query'", () => {
    const store = { dispatch: vi.fn() };
    const api = { util: { resetApiState: vi.fn(() => ({ type: "api/resetApiState" })) } };
    const adapter = createRtkQueryAdapter(store, api);
    expect(adapter.id).toBe("rtk-query");
  });

  it("dispatches api.util.resetApiState() on mock update", () => {
    const store = { dispatch: vi.fn() };
    const resetAction = { type: "api/resetApiState" };
    const api = { util: { resetApiState: vi.fn(() => resetAction) } };
    const adapter = createRtkQueryAdapter(store, api);

    adapter.onMockUpdate("GetUser", "toggle");

    expect(api.util.resetApiState).toHaveBeenCalledOnce();
    expect(store.dispatch).toHaveBeenCalledOnce();
    expect(store.dispatch).toHaveBeenCalledWith(resetAction);
  });

  it("dispatches resetApiState for every mock update event", () => {
    const store = { dispatch: vi.fn() };
    const api = { util: { resetApiState: vi.fn(() => ({ type: "api/resetApiState" })) } };
    const adapter = createRtkQueryAdapter(store, api);

    adapter.onMockUpdate("GetUser", "toggle");
    adapter.onMockUpdate("GetPosts", "variant");
    adapter.onMockUpdate("GetUser", "json-override");

    expect(store.dispatch).toHaveBeenCalledTimes(3);
    expect(api.util.resetApiState).toHaveBeenCalledTimes(3);
  });
});
