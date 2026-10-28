import type { PersistedMockState } from "./store";

const STORAGE_KEY = "msw-devtools-store";

const fallback: PersistedMockState = {
  collapsedGroups: [],
  filter: "all",
  isGrouped: true,
  operations: {},
  sort: "default",
};

describe("sanitizePersistedState", () => {
  let sanitize: typeof import("./store").sanitizePersistedState;
  let defaults: typeof import("./store").defaultConfig;

  beforeEach(async () => {
    vi.resetModules();
    ({ defaultConfig: defaults, sanitizePersistedState: sanitize } = await import("./store"));
  });

  it("returns the fallback for non-object input", () => {
    expect(sanitize(null, fallback)).toBe(fallback);
    expect(sanitize("nope", fallback)).toBe(fallback);
    expect(sanitize(42, fallback)).toBe(fallback);
  });

  it("drops malformed top-level fields", () => {
    const result = sanitize(
      { collapsedGroups: "not-an-array", filter: "bogus", isGrouped: "yes", sort: 3 },
      fallback
    );
    expect(result).toStrictEqual(fallback);
  });

  it("keeps only string entries in collapsedGroups", () => {
    const result = sanitize({ collapsedGroups: ["Users", 1, null, "Auth"] }, fallback);
    expect(result.collapsedGroups).toStrictEqual(["Users", "Auth"]);
  });

  it("normalises operation configs and migrates legacy values", () => {
    const result = sanitize(
      {
        operations: {
          Broken: null,
          Legacy: { activeVariantId: "success", enabled: true },
          Partial: { delay: -5, errorOverride: 418, statusCode: "500" },
        },
      },
      fallback
    );
    expect(result.operations.Broken).toStrictEqual(defaults);
    expect(result.operations.Legacy).toStrictEqual({
      ...defaults,
      activeVariantId: "variant-0",
      enabled: true,
    });
    expect(result.operations.Partial).toStrictEqual(defaults);
  });
});

describe("persistence key", () => {
  const slot = Symbol.for("@mugenlabs/msw-devtools.persistence-key");

  afterEach(() => {
    delete (globalThis as Record<symbol, unknown>)[slot];
    localStorage.removeItem("msw-devtools-store:2");
  });

  it("hydrates from the key set before the store module loads", async () => {
    localStorage.setItem(
      "msw-devtools-store:2",
      JSON.stringify({
        state: { filter: "live", operations: { GetUser: { enabled: true } } },
        version: 0,
      })
    );
    vi.resetModules();
    const { setPersistenceKey } = await import("./persistence-key");
    setPersistenceKey("msw-devtools-store:2");
    const { useMockStore } = await import("./store");

    expect(useMockStore.getState().filter).toBe("live");
    expect(useMockStore.getState().operations.GetUser.enabled).toBe(true);
  });
});

describe("store hydration", () => {
  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it("does not throw when localStorage holds corrupt state", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { collapsedGroups: 7, operations: { GetUser: null } }, version: 0 })
    );
    vi.resetModules();

    const { useMockStore } = await import("./store");

    expect(useMockStore.getState().collapsedGroups).toStrictEqual(new Set());
    expect(useMockStore.getState().operations.GetUser.enabled).toBe(false);
  });
});

describe("store persistence writes", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.removeItem(STORAGE_KEY);
  });

  it("does not rewrite storage for state that is not persisted", async () => {
    vi.resetModules();
    const { useMockStore } = await import("./store");
    useMockStore.getState().setEnabled("GetUser", true);
    const setItem = vi.spyOn(Storage.prototype, "setItem");

    useMockStore.getState().markOperationSeen("GetUser");
    useMockStore.getState().setCapturedResponse("GetUser", "{}");

    expect(setItem).not.toHaveBeenCalled();
  });

  it("keeps working when storage is full", async () => {
    vi.resetModules();
    const { useMockStore } = await import("./store");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    });

    expect(() => useMockStore.getState().setEnabled("GetUser", true)).not.toThrow();
    expect(useMockStore.getState().operations.GetUser.enabled).toBe(true);
  });

  it("picks up changes another tab wrote", async () => {
    vi.resetModules();
    const { useMockStore } = await import("./store");
    useMockStore.getState().setEnabled("GetUser", false);

    const otherTab = {
      state: { operations: { GetUser: { enabled: true } } },
      version: 0,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(otherTab));
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(useMockStore.getState().operations.GetUser.enabled).toBe(true);
  });
});
