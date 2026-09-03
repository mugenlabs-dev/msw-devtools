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
