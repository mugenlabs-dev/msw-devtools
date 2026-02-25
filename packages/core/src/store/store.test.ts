import { useMockStore } from "./store";

const resetStore = () => {
  useMockStore.setState({
    filter: "all",
    isGrouped: true,
    operations: {},
    seenOperations: new Set(),
    sort: "default",
    workerStatus: "idle",
  });
};

const setupMultipleOperations = () => {
  useMockStore.getState().setEnabled("Op1", false);
  useMockStore.getState().setEnabled("Op2", false);
  useMockStore.getState().setEnabled("Op3", true);
};

describe("mockStore - setEnabled", () => {
  it("sets enabled state for an operation", () => {
    resetStore();
    const { setEnabled } = useMockStore.getState();
    setEnabled("GetUser", true);

    const { operations } = useMockStore.getState();
    expect(operations.GetUser.enabled).toBeTruthy();
  });

  it("toggles enabled state", () => {
    resetStore();
    const store = useMockStore.getState();
    store.setEnabled("GetUser", true);
    expect(useMockStore.getState().operations.GetUser.enabled).toBeTruthy();

    useMockStore.getState().setEnabled("GetUser", false);
    expect(useMockStore.getState().operations.GetUser.enabled).toBeFalsy();
  });
});

describe("mockStore - setActiveVariant", () => {
  it("sets the active variant for an operation", () => {
    resetStore();
    useMockStore.getState().setActiveVariant("GetUser", "error");
    expect(useMockStore.getState().operations.GetUser.activeVariantId).toBe("error");
  });

  it("resets customJsonOverride when changing variant", () => {
    resetStore();
    useMockStore.getState().setCustomJsonOverride("GetUser", '{"test":true}');
    useMockStore.getState().setActiveVariant("GetUser", "error");
    expect(useMockStore.getState().operations.GetUser.customJsonOverride).toBeNull();
  });

  it("resets statusCode when changing variant", () => {
    resetStore();
    useMockStore.getState().setStatusCode("GetUser", 404);
    useMockStore.getState().setActiveVariant("GetUser", "error");
    expect(useMockStore.getState().operations.GetUser.statusCode).toBeNull();
  });

  it("resets customHeaders when changing variant", () => {
    resetStore();
    useMockStore.getState().setCustomHeaders("GetUser", '{"X-Test":"1"}');
    useMockStore.getState().setActiveVariant("GetUser", "error");
    expect(useMockStore.getState().operations.GetUser.customHeaders).toBeNull();
  });
});

describe("mockStore - setCustomJsonOverride", () => {
  it("sets custom JSON override", () => {
    resetStore();
    const json = '{"id":1,"name":"Alice"}';
    useMockStore.getState().setCustomJsonOverride("GetUser", json);
    expect(useMockStore.getState().operations.GetUser.customJsonOverride).toBe(json);
  });

  it("can be cleared by setting null", () => {
    resetStore();
    useMockStore.getState().setCustomJsonOverride("GetUser", '{"test":true}');
    useMockStore.getState().setCustomJsonOverride("GetUser", null);
    expect(useMockStore.getState().operations.GetUser.customJsonOverride).toBeNull();
  });
});

describe("mockStore - setDelay", () => {
  it("sets delay for an operation", () => {
    resetStore();
    useMockStore.getState().setDelay("GetUser", 500);
    expect(useMockStore.getState().operations.GetUser.delay).toBe(500);
  });

  it("clamps negative values to 0", () => {
    resetStore();
    useMockStore.getState().setDelay("GetUser", -100);
    expect(useMockStore.getState().operations.GetUser.delay).toBe(0);
  });
});

describe("mockStore - setStatusCode", () => {
  it("sets status code override", () => {
    resetStore();
    useMockStore.getState().setStatusCode("GetUser", 404);
    expect(useMockStore.getState().operations.GetUser.statusCode).toBe(404);
  });

  it("can be cleared by setting null", () => {
    resetStore();
    useMockStore.getState().setStatusCode("GetUser", 500);
    useMockStore.getState().setStatusCode("GetUser", null);
    expect(useMockStore.getState().operations.GetUser.statusCode).toBeNull();
  });
});

describe("mockStore - setCustomHeaders", () => {
  it("sets custom headers JSON string", () => {
    resetStore();
    const headers = '{"Content-Type":"application/xml"}';
    useMockStore.getState().setCustomHeaders("GetUser", headers);
    expect(useMockStore.getState().operations.GetUser.customHeaders).toBe(headers);
  });

  it("can be cleared by setting null", () => {
    resetStore();
    useMockStore.getState().setCustomHeaders("GetUser", '{"X-Test":"1"}');
    useMockStore.getState().setCustomHeaders("GetUser", null);
    expect(useMockStore.getState().operations.GetUser.customHeaders).toBeNull();
  });
});

describe("mockStore - enableAll / disableAll", () => {
  it("enableAll sets all operations to enabled", () => {
    resetStore();
    setupMultipleOperations();
    useMockStore.getState().enableAll();
    const { operations } = useMockStore.getState();
    expect(operations.Op1.enabled).toBeTruthy();
    expect(operations.Op2.enabled).toBeTruthy();
    expect(operations.Op3.enabled).toBeTruthy();
  });

  it("disableAll sets all operations to disabled", () => {
    resetStore();
    setupMultipleOperations();
    useMockStore.getState().disableAll();
    const { operations } = useMockStore.getState();
    expect(operations.Op1.enabled).toBeFalsy();
    expect(operations.Op2.enabled).toBeFalsy();
    expect(operations.Op3.enabled).toBeFalsy();
  });
});

describe("mockStore - workerStatus", () => {
  it("defaults to idle", () => {
    resetStore();
    expect(useMockStore.getState().workerStatus).toBe("idle");
  });

  it("can be set to any status", () => {
    resetStore();
    useMockStore.getState().setWorkerStatus("active");
    expect(useMockStore.getState().workerStatus).toBe("active");

    useMockStore.getState().setWorkerStatus("error");
    expect(useMockStore.getState().workerStatus).toBe("error");
  });
});

describe("mockStore - seenOperations", () => {
  it("defaults to empty set", () => {
    resetStore();
    expect(useMockStore.getState().seenOperations.size).toBe(0);
  });

  it("markOperationSeen adds operation to the set", () => {
    resetStore();
    useMockStore.getState().markOperationSeen("GetUser");
    expect(useMockStore.getState().seenOperations.has("GetUser")).toBeTruthy();
  });

  it("markOperationSeen is idempotent", () => {
    resetStore();
    useMockStore.getState().markOperationSeen("GetUser");
    useMockStore.getState().markOperationSeen("GetUser");
    expect(useMockStore.getState().seenOperations.size).toBe(1);
  });

  it("clearSeenOperations resets the set", () => {
    resetStore();
    useMockStore.getState().markOperationSeen("Op1");
    useMockStore.getState().markOperationSeen("Op2");
    useMockStore.getState().clearSeenOperations();
    expect(useMockStore.getState().seenOperations.size).toBe(0);
  });
});

describe("mockStore - filter / sort / isGrouped", () => {
  it("defaults to filter=all, sort=default, isGrouped=true", () => {
    resetStore();
    const state = useMockStore.getState();
    expect(state.filter).toBe("all");
    expect(state.sort).toBe("default");
    expect(state.isGrouped).toBeTruthy();
  });

  it("setFilter updates the filter value", () => {
    resetStore();
    useMockStore.getState().setFilter("rest");
    expect(useMockStore.getState().filter).toBe("rest");
  });

  it("setSort updates the sort value", () => {
    resetStore();
    useMockStore.getState().setSort("a-z");
    expect(useMockStore.getState().sort).toBe("a-z");
  });

  it("setIsGrouped updates the grouped state", () => {
    resetStore();
    useMockStore.getState().setIsGrouped(false);
    expect(useMockStore.getState().isGrouped).toBeFalsy();
  });
});

describe("mockStore - syncWithRegistry", () => {
  it("adds default config for new operations", () => {
    resetStore();
    useMockStore.getState().syncWithRegistry(["GetUser", "GetPosts"]);
    const { operations } = useMockStore.getState();
    expect(operations.GetUser).toBeDefined();
    expect(operations.GetPosts).toBeDefined();
    expect(operations.GetUser.enabled).toBeFalsy();
    expect(operations.GetUser.activeVariantId).toBe("variant-0");
    expect(operations.GetUser.delay).toBe(0);
  });

  it("preserves existing operation config", () => {
    resetStore();
    useMockStore.getState().setEnabled("GetUser", true);
    useMockStore.getState().setDelay("GetUser", 500);

    useMockStore.getState().syncWithRegistry(["GetUser", "GetPosts"]);
    const { operations } = useMockStore.getState();
    expect(operations.GetUser.enabled).toBeTruthy();
    expect(operations.GetUser.delay).toBe(500);
  });

  it("removes operations not in the registry", () => {
    resetStore();
    useMockStore.getState().setEnabled("GetUser", true);
    useMockStore.getState().setEnabled("GetPosts", true);

    useMockStore.getState().syncWithRegistry(["GetUser"]);
    const { operations } = useMockStore.getState();
    expect(operations.GetUser).toBeDefined();
    expect(operations.GetPosts).toBeUndefined();
  });
});
