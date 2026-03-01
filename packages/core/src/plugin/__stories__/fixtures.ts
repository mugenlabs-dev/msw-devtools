import { graphql, HttpResponse, http } from "msw";
import type {
  GraphQLMockDescriptor,
  HandlerVariant,
  MockOperationDescriptor,
  RestMockDescriptor,
} from "#/registry/types";
import type { OperationMockConfig } from "#/store/types";

// ---------------------------------------------------------------------------
// Handler variants — real MSW handlers wrapped as HandlerVariant objects
// ---------------------------------------------------------------------------

const makeVariant = (
  handler: HandlerVariant["handler"],
  id: string,
  label: string
): HandlerVariant => ({ handler, id, label });

const usersGetHandler = http.get("/api/users", () =>
  HttpResponse.json([
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ])
);

const usersGetEmptyHandler = http.get("/api/users", () => HttpResponse.json([]));

const usersPostHandler = http.post("/api/users", () =>
  HttpResponse.json({ id: 3, name: "Charlie" }, { status: 201 })
);

const usersDeleteHandler = http.delete(
  "/api/users/:id",
  () => new HttpResponse(null, { status: 204 })
);

const productsGetHandler = http.get("/api/products", () =>
  HttpResponse.json([{ id: 1, name: "Widget", price: 9.99 }])
);

const ordersGetHandler = http.get("/api/orders", () =>
  HttpResponse.json([{ id: 1, status: "shipped" }])
);

const getUsersQueryHandler = graphql.query("GetUsers", () =>
  HttpResponse.json({ data: { users: [{ id: "1", name: "Alice" }] } })
);

const createUserMutationHandler = graphql.mutation("CreateUser", () =>
  HttpResponse.json({ data: { createUser: { id: "3", name: "Charlie" } } })
);

// ---------------------------------------------------------------------------
// Mock operation descriptors
// ---------------------------------------------------------------------------

export const restGetDescriptor: RestMockDescriptor = {
  group: "Users",
  method: "get",
  operationName: "GET /api/users",
  path: "/api/users",
  type: "rest",
  variants: [
    makeVariant(usersGetHandler, "variant-0", "Default"),
    makeVariant(usersGetEmptyHandler, "variant-1", "Empty list"),
  ],
};

export const restPostDescriptor: RestMockDescriptor = {
  group: "Users",
  method: "post",
  operationName: "POST /api/users",
  path: "/api/users",
  type: "rest",
  variants: [makeVariant(usersPostHandler, "variant-0", "Default")],
};

export const restDeleteDescriptor: RestMockDescriptor = {
  group: "Users",
  method: "delete",
  operationName: "DELETE /api/users/:id",
  path: "/api/users/:id",
  type: "rest",
  variants: [makeVariant(usersDeleteHandler, "variant-0", "Default")],
};

export const restProductsDescriptor: RestMockDescriptor = {
  group: "Products",
  method: "get",
  operationName: "GET /api/products",
  path: "/api/products",
  type: "rest",
  variants: [makeVariant(productsGetHandler, "variant-0", "Default")],
};

export const restOrdersDescriptor: RestMockDescriptor = {
  method: "get",
  operationName: "GET /api/orders",
  path: "/api/orders",
  type: "rest",
  variants: [makeVariant(ordersGetHandler, "variant-0", "Default")],
};

export const graphqlQueryDescriptor: GraphQLMockDescriptor = {
  group: "Users",
  operationName: "GetUsers",
  operationType: "query",
  type: "graphql",
  variants: [makeVariant(getUsersQueryHandler, "variant-0", "Default")],
};

export const graphqlMutationDescriptor: GraphQLMockDescriptor = {
  group: "Users",
  operationName: "CreateUser",
  operationType: "mutation",
  type: "graphql",
  variants: [makeVariant(createUserMutationHandler, "variant-0", "Default")],
};

export const allDescriptors: MockOperationDescriptor[] = [
  restGetDescriptor,
  restPostDescriptor,
  restDeleteDescriptor,
  restProductsDescriptor,
  restOrdersDescriptor,
  graphqlQueryDescriptor,
  graphqlMutationDescriptor,
];

// ---------------------------------------------------------------------------
// Pre-built OperationMockConfig variants
// ---------------------------------------------------------------------------

export { defaultConfig } from "#/store/store";

export const enabledConfig: OperationMockConfig = {
  ...defaultConfig,
  enabled: true,
};

export const errorOverrideConfig: OperationMockConfig = {
  ...defaultConfig,
  enabled: true,
  errorOverride: 500,
};

export const customJsonConfig: OperationMockConfig = {
  ...defaultConfig,
  customJsonOverride: '{"custom": true}',
  enabled: true,
};

export const delayedConfig: OperationMockConfig = {
  ...defaultConfig,
  delay: 2000,
  enabled: true,
};

export const customStatusConfig: OperationMockConfig = {
  ...defaultConfig,
  enabled: true,
  statusCode: 201,
};

export const customHeadersConfig: OperationMockConfig = {
  ...defaultConfig,
  customHeaders: '{"X-Custom": "value"}',
  enabled: true,
};

// ---------------------------------------------------------------------------
// Helper to build operations record from descriptors
// ---------------------------------------------------------------------------

export const buildOperations = (
  descriptors: MockOperationDescriptor[],
  config: OperationMockConfig = defaultConfig
): Record<string, OperationMockConfig> => {
  const operations: Record<string, OperationMockConfig> = {};
  for (const d of descriptors) {
    operations[d.operationName] = { ...config };
  }
  return operations;
};
