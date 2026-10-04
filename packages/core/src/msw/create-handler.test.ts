import { delay, graphql, HttpResponse, http } from "msw";
import { mockRegistry } from "#/registry/registry";
import type { GraphQLMockDescriptor, RestMockDescriptor } from "#/registry/types";
import { defaultConfig, useMockStore } from "#/store/store";
import type { OperationMockConfig } from "#/store/types";
import { createDynamicHandler } from "./create-handler";

vi.mock("msw", async (importOriginal) => {
  const actual = await importOriginal<typeof import("msw")>();
  return {
    ...actual,
    delay: vi.fn(() => Promise.resolve()),
  };
});

const restDescriptor = (overrides: Partial<RestMockDescriptor> = {}): RestMockDescriptor => ({
  method: "get",
  operationName: "GET /api/users",
  path: "http://localhost/api/users",
  type: "rest",
  variants: [
    {
      handler: http.get("http://localhost/api/users", () => HttpResponse.json({ users: [1, 2] })),
      id: "variant-0",
      label: "Default",
    },
  ],
  ...overrides,
});

const graphqlDescriptor = (
  overrides: Partial<GraphQLMockDescriptor> = {}
): GraphQLMockDescriptor => ({
  endpoint: "*",
  graphqlOperationName: "GetPancham",
  operationName: "GetPancham",
  operationType: "query",
  type: "graphql",
  variants: [
    {
      handler: graphql.query("GetPancham", () => HttpResponse.json({ data: { name: "Pancham" } })),
      id: "variant-0",
      label: "Default",
    },
  ],
  ...overrides,
});

const configure = (operationName: string, config: Partial<OperationMockConfig> = {}) => {
  useMockStore.setState((state) => ({
    operations: {
      ...state.operations,
      [operationName]: { ...defaultConfig, enabled: true, ...config },
    },
  }));
};

/** Run a handler against a request the way MSW would, returning the mocked response. */
const run = async (handler: ReturnType<typeof createDynamicHandler>, request: Request) => {
  const result = await handler.run({ request, requestId: "test" });
  return result?.response ?? null;
};

const restRequest = () => new Request("http://localhost/api/users");

const graphqlRequest = (operationName: string) =>
  new Request("http://localhost/graphql", {
    body: JSON.stringify({
      operationName,
      query: `query ${operationName} { pokemon { name } }`,
    }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });

describe("createDynamicHandler", () => {
  beforeEach(() => {
    for (const descriptor of mockRegistry.getAll()) {
      mockRegistry.unregister(descriptor.operationName);
    }
    useMockStore.setState({ capturedResponseData: new Map(), operations: {} });
    vi.mocked(delay).mockClear();
  });

  describe("GraphQL matching", () => {
    it("matches the handler's operation name when the display name is overridden", async () => {
      const descriptor = graphqlDescriptor({ operationName: "Pancham (custom)" });
      configure("Pancham (custom)");

      const response = await run(createDynamicHandler(descriptor), graphqlRequest("GetPancham"));

      expect(response).not.toBeNull();
      await expect(response?.json()).resolves.toStrictEqual({ data: { name: "Pancham" } });
    });

    it("does not match a request for the display name", async () => {
      const descriptor = graphqlDescriptor({ operationName: "Pancham (custom)" });
      configure("Pancham (custom)");

      const response = await run(createDynamicHandler(descriptor), graphqlRequest("PanchamCustom"));

      expect(response).toBeNull();
    });
  });

  describe("status code override", () => {
    it("applies a valid status override", async () => {
      const descriptor = restDescriptor();
      configure(descriptor.operationName, { statusCode: 201 });

      const response = await run(createDynamicHandler(descriptor), restRequest());

      expect(response?.status).toBe(201);
      await expect(response?.json()).resolves.toStrictEqual({ users: [1, 2] });
    });

    it("ignores a status override outside the range a Response can represent", async () => {
      const descriptor = restDescriptor();
      configure(descriptor.operationName, { statusCode: 2 });

      const response = await run(createDynamicHandler(descriptor), restRequest());

      expect(response?.status).toBe(200);
      await expect(response?.json()).resolves.toStrictEqual({ users: [1, 2] });
    });

    it("keeps a non-JSON body when only the status is overridden", async () => {
      const descriptor = restDescriptor({
        variants: [
          {
            handler: http.get("http://localhost/api/users", () => HttpResponse.text("hello")),
            id: "variant-0",
            label: "Default",
          },
        ],
      });
      configure(descriptor.operationName, { statusCode: 202 });

      const response = await run(createDynamicHandler(descriptor), restRequest());

      expect(response?.status).toBe(202);
      expect(response?.headers.get("content-type")).toContain("text/plain");
      await expect(response?.text()).resolves.toBe("hello");
    });

    it("returns an empty body for null-body statuses", async () => {
      const descriptor = restDescriptor();
      configure(descriptor.operationName, { statusCode: 204 });

      const response = await run(createDynamicHandler(descriptor), restRequest());

      expect(response?.status).toBe(204);
      await expect(response?.text()).resolves.toBe("");
    });
  });

  describe("delay", () => {
    it("does not call msw delay when delay is 0", async () => {
      const descriptor = restDescriptor();
      configure(descriptor.operationName, { delay: 0 });

      const response = await run(createDynamicHandler(descriptor), restRequest());

      expect(delay).not.toHaveBeenCalled();
      await expect(response?.json()).resolves.toStrictEqual({ users: [1, 2] });
    });

    it("awaits msw delay with the configured milliseconds", async () => {
      const descriptor = restDescriptor();
      configure(descriptor.operationName, { delay: 250 });

      const response = await run(createDynamicHandler(descriptor), restRequest());

      expect(delay).toHaveBeenCalledOnce();
      expect(delay).toHaveBeenCalledWith(250);
      await expect(response?.json()).resolves.toStrictEqual({ users: [1, 2] });
    });
  });

  describe("JSON override", () => {
    it("replaces the body with a valid JSON override", async () => {
      const descriptor = restDescriptor();
      configure(descriptor.operationName, { customJsonOverride: '{"users":[]}' });

      const response = await run(createDynamicHandler(descriptor), restRequest());

      await expect(response?.json()).resolves.toStrictEqual({ users: [] });
    });

    it("falls back to the handler body when the override is not valid JSON", async () => {
      const descriptor = restDescriptor();
      configure(descriptor.operationName, { customJsonOverride: "{not json" });

      const response = await run(createDynamicHandler(descriptor), restRequest());

      await expect(response?.json()).resolves.toStrictEqual({ users: [1, 2] });
    });
  });

  describe("handler options", () => {
    it("preserves `once` from the user's handler", async () => {
      const descriptor = restDescriptor({
        variants: [
          {
            handler: http.get("http://localhost/api/users", () => HttpResponse.json({ n: 1 }), {
              once: true,
            }),
            id: "variant-0",
            label: "Default",
            options: { once: true },
          },
        ],
      });
      configure(descriptor.operationName);
      const handler = createDynamicHandler(descriptor);

      const first = await run(handler, restRequest());
      const second = await run(handler, restRequest());

      await expect(first?.json()).resolves.toStrictEqual({ n: 1 });
      expect(second).toBeNull();
    });

    it("scopes GraphQL handlers to their graphql.link endpoint", async () => {
      const descriptor = graphqlDescriptor({ endpoint: "http://api.example.com/graphql" });
      configure(descriptor.operationName);
      const handler = createDynamicHandler(descriptor);

      const other = new Request("http://elsewhere.test/graphql", {
        body: JSON.stringify({ operationName: "GetPancham", query: "query GetPancham { id }" }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      const scoped = new Request("http://api.example.com/graphql", {
        body: JSON.stringify({ operationName: "GetPancham", query: "query GetPancham { id }" }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });

      expect(await run(handler, other)).toBeNull();
      expect(await run(handler, scoped)).not.toBeNull();
    });

    it("supports RegExp paths", async () => {
      const path = /\/api\/users\/\d+$/;
      const descriptor = restDescriptor({
        operationName: "GET user by id",
        path,
        variants: [
          {
            handler: http.get(path, () => HttpResponse.json({ id: 42 })),
            id: "variant-0",
            label: "Default",
          },
        ],
      });
      configure(descriptor.operationName);

      const response = await run(
        createDynamicHandler(descriptor),
        new Request("http://localhost/api/users/42")
      );

      await expect(response?.json()).resolves.toStrictEqual({ id: 42 });
    });
  });

  describe("REST", () => {
    it("falls back to the first variant when the selected id is unknown", async () => {
      const descriptor = restDescriptor();
      configure(descriptor.operationName, { activeVariantId: "variant-from-an-older-version" });

      const response = await run(createDynamicHandler(descriptor), restRequest());

      await expect(response?.json()).resolves.toStrictEqual({ users: [1, 2] });
    });

    it("returns the handler response when enabled", async () => {
      const descriptor = restDescriptor();
      configure(descriptor.operationName);

      const response = await run(createDynamicHandler(descriptor), restRequest());

      await expect(response?.json()).resolves.toStrictEqual({ users: [1, 2] });
    });

    it("passes through when the operation is disabled", async () => {
      const descriptor = restDescriptor();
      configure(descriptor.operationName, { enabled: false });

      const response = await run(createDynamicHandler(descriptor), restRequest());

      // MSW represents passthrough as a 302 to the "mswjs.io/passthrough" sentinel.
      expect(response?.headers.get("x-msw-intention")).toBe("passthrough");
    });
  });
});
