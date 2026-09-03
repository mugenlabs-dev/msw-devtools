import { graphql, HttpResponse, http } from "msw";
import { mockRegistry } from "#/registry/registry";
import type { GraphQLMockDescriptor, RestMockDescriptor } from "#/registry/types";
import { defaultConfig, useMockStore } from "#/store/store";
import type { OperationMockConfig } from "#/store/types";
import { createDynamicHandler } from "./create-handler";

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

  describe("REST", () => {
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
