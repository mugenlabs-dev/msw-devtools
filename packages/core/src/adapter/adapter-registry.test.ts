import type { getAdapters, registerAdapter } from "./adapter-registry";
import type { dispatchMockUpdate } from "./event-bus";
import type { MswDevToolAdapter } from "./types";

describe("adapter-registry", () => {
  let registerAdapterFn: typeof registerAdapter;
  let getAdaptersFn: typeof getAdapters;
  let dispatchMockUpdateFn: typeof dispatchMockUpdate;

  beforeEach(async () => {
    vi.resetModules();
    const adapterMod = await import("./adapter-registry");
    const eventBusMod = await import("./event-bus");
    ({ registerAdapter: registerAdapterFn } = adapterMod);
    ({ getAdapters: getAdaptersFn } = adapterMod);
    ({ dispatchMockUpdate: dispatchMockUpdateFn } = eventBusMod);
  });

  describe("registration", () => {
    it("registers an adapter and it appears in getAdapters", () => {
      const adapter: MswDevToolAdapter = {
        id: "test",
        onMockUpdate: vi.fn(),
      };

      registerAdapterFn(adapter);
      expect(getAdaptersFn()).toContainEqual(adapter);
    });

    it("calls adapter.setup() on registration", () => {
      const setup = vi.fn();
      const adapter: MswDevToolAdapter = {
        id: "test",
        onMockUpdate: vi.fn(),
        setup,
      };

      registerAdapterFn(adapter);
      expect(setup).toHaveBeenCalledOnce();
    });

    it("forwards mock update events to registered adapter", () => {
      const onMockUpdateFn = vi.fn();
      const adapter: MswDevToolAdapter = {
        id: "test",
        onMockUpdate: onMockUpdateFn,
      };

      registerAdapterFn(adapter);
      dispatchMockUpdateFn("GetUser", "toggle");

      expect(onMockUpdateFn).toHaveBeenCalledWith("GetUser", "toggle");
    });

    it("supports registering multiple adapters", () => {
      const adapter1: MswDevToolAdapter = { id: "a1", onMockUpdate: vi.fn() };
      const adapter2: MswDevToolAdapter = { id: "a2", onMockUpdate: vi.fn() };

      registerAdapterFn(adapter1);
      registerAdapterFn(adapter2);

      expect(getAdaptersFn()).toHaveLength(2);
    });
  });

  describe("unregistration", () => {
    it("returns an unregister function that removes the adapter", () => {
      const adapter: MswDevToolAdapter = {
        id: "test",
        onMockUpdate: vi.fn(),
      };

      const unregister = registerAdapterFn(adapter);
      expect(getAdaptersFn()).toHaveLength(1);

      unregister();
      expect(getAdaptersFn()).toHaveLength(0);
    });

    it("calls cleanup from setup() on unregister", () => {
      const cleanup = vi.fn();
      const adapter: MswDevToolAdapter = {
        id: "test",
        onMockUpdate: vi.fn(),
        setup: () => cleanup,
      };

      const unregister = registerAdapterFn(adapter);
      unregister();
      expect(cleanup).toHaveBeenCalledOnce();
    });

    it("stops forwarding events after unregister", () => {
      const onMockUpdateFn = vi.fn();
      const adapter: MswDevToolAdapter = {
        id: "test",
        onMockUpdate: onMockUpdateFn,
      };

      const unregister = registerAdapterFn(adapter);
      unregister();

      dispatchMockUpdateFn("GetUser", "toggle");
      expect(onMockUpdateFn).not.toHaveBeenCalled();
    });
  });
});
