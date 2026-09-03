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

  it("marks a REST operation registered with an MSW wildcard path as seen", () => {
    mockRegistry.register(
      restDescriptor({ operationName: "GET Users", path: "https://api.example.com/users/*" })
    );
    const { emit, worker } = createFakeWorker();
    setupOperationTracker(worker as never);

    emit(new Request("https://api.example.com/users/123/profile", { method: "GET" }));

    expect(seen().has("GET Users")).toBe(true);
  });

  it("removes the request listener on teardown", () => {
    mockRegistry.register(restDescriptor({}));
    const { emit, worker } = createFakeWorker();
    setupOperationTracker(worker as never);

    teardownOperationTracker();
    emit(new Request("http://localhost/api/todos", { method: "GET" }));

    expect(seen().has("GET /api/todos")).toBe(false);
  });
});
