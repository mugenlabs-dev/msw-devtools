import { createSwrAdapter } from "./swr-adapter";

describe("swr adapter", () => {
  it("returns an adapter with id 'swr'", () => {
    const mutate = vi.fn();
    const adapter = createSwrAdapter(mutate);
    expect(adapter.id).toBe("swr");
  });

  it("calls mutate with revalidate on mock update", () => {
    const mutate = vi.fn();
    const adapter = createSwrAdapter(mutate);

    adapter.onMockUpdate("GetUser", "toggle");

    expect(mutate).toHaveBeenCalledOnce();
    expect(mutate).toHaveBeenCalledWith(expect.any(Function), undefined, {
      revalidate: true,
    });
  });

  it("passes a matcher function that returns true for all keys", () => {
    const mutate = vi.fn();
    const adapter = createSwrAdapter(mutate);

    adapter.onMockUpdate("GetUser", "toggle");

    const [[matcher]] = mutate.mock.calls;
    expect(matcher("any-key")).toBeTruthy();
    expect(matcher("")).toBeTruthy();
  });
});
