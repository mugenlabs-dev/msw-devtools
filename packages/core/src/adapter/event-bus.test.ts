import type { dispatchMockUpdate, onMockUpdate } from "./event-bus";

describe("event-bus", () => {
  let dispatchMockUpdateFn: typeof dispatchMockUpdate;
  let onMockUpdateFn: typeof onMockUpdate;
  let MOCK_UPDATE_EVENT_NAME: string;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import("./event-bus");
    ({ dispatchMockUpdate: dispatchMockUpdateFn } = mod);
    ({ onMockUpdate: onMockUpdateFn } = mod);
    ({ MOCK_UPDATE_EVENT_NAME } = mod);
  });

  it("exports the correct event name", () => {
    expect(MOCK_UPDATE_EVENT_NAME).toBe("msw-devtool-mock-updated");
  });

  describe("dispatching mock updates", () => {
    it("dispatches a CustomEvent on window", () => {
      const handler = vi.fn();
      window.addEventListener("msw-devtool-mock-updated", handler);

      dispatchMockUpdateFn("GetUser", "toggle");

      expect(handler).toHaveBeenCalledOnce();
      const event = handler.mock.calls[0][0] as CustomEvent;
      expect(event.detail).toStrictEqual({
        changeType: "toggle",
        operationName: "GetUser",
      });

      window.removeEventListener("msw-devtool-mock-updated", handler);
    });

    it("defaults changeType to 'toggle'", () => {
      const handler = vi.fn();
      window.addEventListener("msw-devtool-mock-updated", handler);

      dispatchMockUpdateFn("GetUser");

      const event = handler.mock.calls[0][0] as CustomEvent;
      expect(event.detail.changeType).toBe("toggle");

      window.removeEventListener("msw-devtool-mock-updated", handler);
    });
  });

  describe("subscribing to mock updates", () => {
    it("subscribes to mock update events", () => {
      const callback = vi.fn();
      const unsub = onMockUpdateFn(callback);

      dispatchMockUpdateFn("GetUser", "variant");

      expect(callback).toHaveBeenCalledOnce();
      expect(callback).toHaveBeenCalledWith({
        changeType: "variant",
        operationName: "GetUser",
      });

      unsub();
    });

    it("returns an unsubscribe function", () => {
      const callback = vi.fn();
      const unsub = onMockUpdateFn(callback);

      dispatchMockUpdateFn("GetUser", "toggle");
      expect(callback).toHaveBeenCalledOnce();

      unsub();
      dispatchMockUpdateFn("GetUser", "toggle");
      // not called again
      expect(callback).toHaveBeenCalledOnce();
    });

    it("supports multiple subscribers", () => {
      const cb1 = vi.fn();
      const cb2 = vi.fn();
      const unsub1 = onMockUpdateFn(cb1);
      const unsub2 = onMockUpdateFn(cb2);

      dispatchMockUpdateFn("GetUser", "toggle");

      expect(cb1).toHaveBeenCalledOnce();
      expect(cb2).toHaveBeenCalledOnce();

      unsub1();
      unsub2();
    });
  });
});
