import { mockRegistry } from "#/registry/registry";
import type { RestMockDescriptor } from "#/registry/types";
import { useMockStore } from "#/store/store";
import { setupOperationTracker, teardownOperationTracker } from "./operation-tracker";

type RequestStartListener = (args: { request: Request }) => void;

const restDescriptor = (overrides: Partial<RestMockDescriptor>): RestMockDescriptor => ({
  method: "get",
  operationName: "GET /api/todos",
  path: "/api/todos",
  type: "rest",
  variants: [],
  ...overrides,
});

const createFakeWorker = () => {
  let listener: RequestStartListener | undefined;
  const worker = {
    events: {
      on: (_event: string, cb: RequestStartListener) => {
        listener = cb;
      },
      removeListener: (_event: string, cb: RequestStartListener) => {
        if (listener === cb) {
          listener = undefined;
        }
      },
    },
  };
  const emit = (request: Request) => listener?.({ request });
  return { emit, worker };
};

const seen = () => useMockStore.getState().seenOperations;

// Flush the async GraphQL POST body parsing inside the tracker.
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("operation-tracker", () => {
  beforeEach(() => {
    for (const descriptor of mockRegistry.getAll()) {
      mockRegistry.unregister(descriptor.operationName);
    }
    useMockStore.getState().clearSeenOperations();
  });

  afterEach(() => {
    teardownOperationTracker();
  });

  it("marks a REST GET operation as seen", () => {
    mockRegistry.register(restDescriptor({}));
    const { emit, worker } = createFakeWorker();
    setupOperationTracker(worker as never);

    emit(new Request("http://localhost/api/todos", { method: "GET" }));

    expect(seen().has("GET /api/todos")).toBe(true);
  });

  it("marks a REST POST mutation with a JSON body as seen", async () => {
    mockRegistry.register(
      restDescriptor({ method: "post", operationName: "CreateTodo", path: "/api/todos" })
    );
    const { emit, worker } = createFakeWorker();
    setupOperationTracker(worker as never);

    emit(
      new Request("http://localhost/api/todos", {
        body: JSON.stringify({ title: "buy milk" }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );
    await flush();

    expect(seen().has("CreateTodo")).toBe(true);
  });

  it("marks REST PUT and DELETE mutations as seen", () => {
    mockRegistry.register(
      restDescriptor({ method: "put", operationName: "UpdateTodo", path: "/api/todos/:id" }),
      restDescriptor({ method: "delete", operationName: "DeleteTodo", path: "/api/todos/:id" })
    );
    const { emit, worker } = createFakeWorker();
    setupOperationTracker(worker as never);

    emit(new Request("http://localhost/api/todos/42", { body: "{}", method: "PUT" }));
    emit(new Request("http://localhost/api/todos/42", { method: "DELETE" }));

    expect(seen().has("UpdateTodo")).toBe(true);
    expect(seen().has("DeleteTodo")).toBe(true);
  });

  it("marks a GraphQL mutation POST as seen via its operation name", async () => {
    const { emit, worker } = createFakeWorker();
    setupOperationTracker(worker as never);

    emit(
      new Request("http://localhost/graphql", {
        body: JSON.stringify({
          query: 'mutation AddPokemon { addPokemon(name: "mew") { id } }',
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );
    await flush();

    expect(seen().has("AddPokemon")).toBe(true);
  });

  it("marks a GraphQL operation with an overridden display name as seen", async () => {
    mockRegistry.register({
      endpoint: "*",
      graphqlOperationName: "GetPancham",
      operationName: "Pancham (custom)",
      operationType: "query",
      type: "graphql",
      variants: [],
    });
    const { emit, worker } = createFakeWorker();
    setupOperationTracker(worker as never);

    emit(
      new Request("http://localhost/graphql", {
        body: JSON.stringify({ operationName: "GetPancham", query: "query GetPancham { id }" }),
        headers: { "content-type": "application/json" },
        method: "POST",
      })
    );
    await flush();

    expect(seen().has("Pancham (custom)")).toBe(true);
    expect(seen().has("GetPancham")).toBe(false);
  });

  it("marks a REST operation with an absolute URL and query string as seen", () => {
    mockRegistry.register(
      restDescriptor({
        operationName: "GET Charizard",
        path: "https://pokeapi.co/api/v2/pokemon/6",
      })
    );
    const { emit, worker } = createFakeWorker();
    setupOperationTracker(worker as never);

    emit(new Request("https://pokeapi.co/api/v2/pokemon/6?verbose=1", { method: "GET" }));

    expect(seen().has("GET Charizard")).toBe(true);
  });

  it("marks a REST operation registered with a RegExp path as seen", () => {
    mockRegistry.register(
      restDescriptor({ operationName: "GET user by id", path: /\/api\/users\/\d+$/ })
    );
    const { emit, worker } = createFakeWorker();
    setupOperationTracker(worker as never);

    emit(new Request("http://localhost/api/users/42", { method: "GET" }));

    expect(seen().has("GET user by id")).toBe(true);
  });

  it("marks an http.all operation as seen for any method", () => {
    mockRegistry.register(restDescriptor({ method: "all", operationName: "ALL /api/todos" }));
    const { emit, worker } = createFakeWorker();
    setupOperationTracker(worker as never);

    emit(new Request("http://localhost/api/todos", { method: "PATCH" }));

    expect(seen().has("ALL /api/todos")).toBe(true);
  });

  it("matches a global RegExp path on every request, not every other one", () => {
    mockRegistry.register(
      restDescriptor({
        operationName: "GET user by id",
        path: /^http:\/\/localhost\/api\/users\/\d+$/g,
      })
    );
    const { emit, worker } = createFakeWorker();
    setupOperationTracker(worker as never);

    for (let i = 0; i < 3; i += 1) {
      useMockStore.getState().clearSeenOperations();
      emit(new Request("http://localhost/api/users/42", { method: "GET" }));
      expect(seen().has("GET user by id")).toBe(true);
    }
  });

  it("marks a REST operation registered with an MSW wildcard path as seen", () => {
    mockRegistry.register(
      restDescriptor({ operationName: "GET Users", path: "https://api.example.com/users/*" })
    );
    const { emit, worker } = createFakeWorker();
    setupOperationTracker(worker as never);

    emit(new Request("https://api.example.com/users/123/profile", { method: "GET" }));

    expect(seen().has("GET Users")).toBe(true);
  });

  it("keeps LIVE operations when only the URL's query or state changes", () => {
    mockRegistry.register(restDescriptor({}));
    const { emit, worker } = createFakeWorker();
    setupOperationTracker(worker as never);
    emit(new Request("http://localhost/api/todos", { method: "GET" }));

    history.replaceState({ scroll: 120 }, "");
    history.pushState(null, "", `${window.location.pathname}?tab=2`);

    expect(seen().has("GET /api/todos")).toBe(true);
  });

  it("clears LIVE operations when the page changes", () => {
    mockRegistry.register(restDescriptor({}));
    const { emit, worker } = createFakeWorker();
    setupOperationTracker(worker as never);
    emit(new Request("http://localhost/api/todos", { method: "GET" }));

    history.pushState(null, "", "/another-page");

    expect(seen().size).toBe(0);
    history.pushState(null, "", "/");
  });

  it("removes the request listener on teardown", () => {
    mockRegistry.register(restDescriptor({}));
    const { emit, worker } = createFakeWorker();
    setupOperationTracker(worker as never);

    teardownOperationTracker();
    emit(new Request("http://localhost/api/todos", { method: "GET" }));

    expect(seen().has("GET /api/todos")).toBe(false);
  });

  it("ignores document navigations and form submissions", () => {
    mockRegistry.register(restDescriptor({ path: "/" }));
    const { emit, worker } = createFakeWorker();
    setupOperationTracker(worker as never);

    // Node's Request rejects mode:"navigate"; shape the object MSW emits instead.
    const navigateGet = new Request("http://localhost/", { method: "GET" });
    Object.defineProperty(navigateGet, "mode", { value: "navigate" });
    const navigatePost = new Request("http://localhost/", {
      body: "q=1",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      method: "POST",
    });
    Object.defineProperty(navigatePost, "mode", { value: "navigate" });

    emit(navigateGet);
    emit(navigatePost);

    expect(seen().size).toBe(0);
  });
});
