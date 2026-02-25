// --- DevTools Plugin ---

// --- Adapter System ---
// ---------------------------------------------------------------------------
// Internal — used by the plugin UI and adapters. Not part of the public API.
// Do not document or recommend these to end users.
// ---------------------------------------------------------------------------
export { getAdapters, registerAdapter } from "./adapter/adapter-registry";
export { dispatchMockUpdate, MOCK_UPDATE_EVENT_NAME, onMockUpdate } from "./adapter/event-bus";
export type { MockChangeType, MockUpdateEvent, MswDevToolAdapter } from "./adapter/types";
// --- React Hooks ---
export { useMockRefetch } from "./hooks/use-mock-refetch";
export type { WorkerOptions } from "./msw/worker-manager";
// --- MSW Integration ---
export { getWorker, refreshHandlers, startWorker } from "./msw/worker-manager";
export type { MswDevToolsPluginOptions } from "./plugin/create-msw-dev-tools-plugin";
export { createMswDevToolsPlugin } from "./plugin/create-msw-dev-tools-plugin";
export { MswDevToolsPlugin } from "./plugin/msw-dev-tools-plugin";
// --- Registry (Public API) ---
export { mockRegistry, registerGraphqlMocks, registerRestMocks } from "./registry/registry";
export type {
  GraphQLMockDescriptor,
  GraphQLOperationType,
  GraphqlMockDef,
  HandlerVariant,
  MockOperationDescriptor,
  RestMethod,
  RestMockDef,
  RestMockDescriptor,
} from "./registry/types";
export { isGraphQLDescriptor, isRestDescriptor } from "./registry/types";
export { mockStore, useMockStore } from "./store/store";
export type {
  ErrorOverride,
  MockStoreState,
  OperationMockConfig,
  WorkerStatus,
} from "./store/types";
