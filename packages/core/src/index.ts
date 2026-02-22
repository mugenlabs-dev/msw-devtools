// Registry
export { mockRegistry, registerMocks } from "./registry/registry";
export { discoverFromHandlers } from "./registry/auto-discover";
export { withStandardVariants, withRestVariants } from "./registry/helpers";
export {
	isGraphQLDescriptor,
	isRestDescriptor,
} from "./registry/types";

// Store
export { useMockStore, mockStore } from "./store/store";

// MSW integration
export {
	startWorker,
	getWorker,
	refreshHandlers,
} from "./msw/worker-manager";

// Adapter system
export { registerAdapter, getAdapters } from "./adapter/create-adapter";
export {
	dispatchMockUpdate,
	onMockUpdate,
	MOCK_UPDATE_EVENT_NAME,
} from "./adapter/event-bus";

// React — Plugin
export { createMswDevToolsPlugin } from "./plugin/createMswDevToolsPlugin";
export type { MswDevToolsPluginOptions } from "./plugin/createMswDevToolsPlugin";
export { MswDevToolsPlugin } from "./plugin/MswDevToolsPlugin";

// React — Hooks
export { useMockRefetch } from "./hooks/useMockRefetch";

// React — Bootstrap
export { enableMocking } from "./bootstrap/enable-mocking";
export { MswBootstrap } from "./bootstrap/MswBootstrap";
export type { MswBootstrapProps } from "./bootstrap/MswBootstrap";

// Types
export type {
	MockVariant,
	GraphQLOperationType,
	RestMethod,
	GraphQLMockDescriptor,
	RestMockDescriptor,
	MockOperationDescriptor,
} from "./registry/types";
export type {
	OperationMockConfig,
	WorkerStatus,
	MockStoreState,
} from "./store/types";
export type {
	MswDevToolAdapter,
	MockChangeType,
	MockUpdateEvent,
} from "./adapter/types";
export type { WorkerOptions } from "./msw/worker-manager";
