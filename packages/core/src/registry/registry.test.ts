import type { mockRegistry } from "./registry";
import type { MockOperationDescriptor } from "./types";

const graphqlDescriptor: MockOperationDescriptor = {
  operationName: "GetUser",
  operationType: "query",
  type: "graphql",
  variants: [],
};

const restDescriptor: MockOperationDescriptor = {
  method: "get",
  operationName: "GET Users",
  path: "/api/users",
  type: "rest",
  variants: [],
};

describe("mock registry", () => {
  let mockRegistryInstance: typeof mockRegistry;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import("./registry");
    ({ mockRegistry: mockRegistryInstance } = mod);
  });

  describe("register", () => {
    it("registers a single descriptor", () => {
      mockRegistryInstance.register(graphqlDescriptor);
      expect(mockRegistryInstance.size).toBe(1);
      expect(mockRegistryInstance.get("GetUser")).toStrictEqual(graphqlDescriptor);
    });

    it("registers multiple descriptors", () => {
      mockRegistryInstance.register(graphqlDescriptor, restDescriptor);
      expect(mockRegistryInstance.size).toBe(2);
    });

    it("overwrites existing descriptor with same operationName", () => {
      const updated = { ...graphqlDescriptor, variants: [] };
      mockRegistryInstance.register(graphqlDescriptor);
      mockRegistryInstance.register(updated);
      expect(mockRegistryInstance.size).toBe(1);
      expect(mockRegistryInstance.get("GetUser")?.variants).toStrictEqual([]);
    });

    it("notifies listeners on register", () => {
      const listener = vi.fn();
      mockRegistryInstance.subscribe(listener);
      mockRegistryInstance.register(graphqlDescriptor);
      expect(listener).toHaveBeenCalledOnce();
    });
  });

  describe("unregister", () => {
    it("removes a descriptor by operationName", () => {
      mockRegistryInstance.register(graphqlDescriptor);
      mockRegistryInstance.unregister("GetUser");
      expect(mockRegistryInstance.size).toBe(0);
      expect(mockRegistryInstance.get("GetUser")).toBeUndefined();
    });

    it("notifies listeners on unregister", () => {
      mockRegistryInstance.register(graphqlDescriptor);
      const listener = vi.fn();
      mockRegistryInstance.subscribe(listener);
      mockRegistryInstance.unregister("GetUser");
      expect(listener).toHaveBeenCalledOnce();
    });

    it("is safe to unregister non-existent descriptor", () => {
      expect(() => {
        mockRegistryInstance.unregister("NonExistent");
      }).not.toThrow();
    });
  });

  describe("getAll", () => {
    it("returns empty array when no descriptors registered", () => {
      expect(mockRegistryInstance.getAll()).toStrictEqual([]);
    });

    it("returns all registered descriptors", () => {
      mockRegistryInstance.register(graphqlDescriptor, restDescriptor);
      const all = mockRegistryInstance.getAll();
      expect(all).toHaveLength(2);
      expect(all).toContainEqual(graphqlDescriptor);
      expect(all).toContainEqual(restDescriptor);
    });

    it("returns a stable reference (cached snapshot)", () => {
      mockRegistryInstance.register(graphqlDescriptor);
      const first = mockRegistryInstance.getAll();
      const second = mockRegistryInstance.getAll();
      expect(first).toBe(second);
    });

    it("returns a new reference after mutation", () => {
      mockRegistryInstance.register(graphqlDescriptor);
      const first = mockRegistryInstance.getAll();
      mockRegistryInstance.register(restDescriptor);
      const second = mockRegistryInstance.getAll();
      expect(first).not.toBe(second);
    });
  });

  describe("get and subscribe", () => {
    it("returns undefined for non-existent descriptor", () => {
      expect(mockRegistryInstance.get("NonExistent")).toBeUndefined();
    });

    it("returns the correct descriptor", () => {
      mockRegistryInstance.register(graphqlDescriptor, restDescriptor);
      expect(mockRegistryInstance.get("GetUser")).toStrictEqual(graphqlDescriptor);
      expect(mockRegistryInstance.get("GET Users")).toStrictEqual(restDescriptor);
    });

    it("subscribe returns an unsubscribe function", () => {
      const listener = vi.fn();
      const unsub = mockRegistryInstance.subscribe(listener);
      mockRegistryInstance.register(graphqlDescriptor);
      expect(listener).toHaveBeenCalledOnce();

      unsub();
      mockRegistryInstance.register(restDescriptor);
      // not called again
      expect(listener).toHaveBeenCalledOnce();
    });

    it("subscribe supports multiple listeners", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      mockRegistryInstance.subscribe(listener1);
      mockRegistryInstance.subscribe(listener2);

      mockRegistryInstance.register(graphqlDescriptor);
      expect(listener1).toHaveBeenCalledOnce();
      expect(listener2).toHaveBeenCalledOnce();
    });
  });

  describe("size", () => {
    it("returns 0 for empty registry", () => {
      expect(mockRegistryInstance.size).toBe(0);
    });

    it("reflects current descriptor count", () => {
      mockRegistryInstance.register(graphqlDescriptor);
      expect(mockRegistryInstance.size).toBe(1);
      mockRegistryInstance.register(restDescriptor);
      expect(mockRegistryInstance.size).toBe(2);
      mockRegistryInstance.unregister("GetUser");
      expect(mockRegistryInstance.size).toBe(1);
    });
  });
});
