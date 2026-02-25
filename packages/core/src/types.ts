/**
 * Types-only entry point for consumers who need type imports
 * without pulling in runtime code.
 *
 * Usage: import type { MockOperationDescriptor } from "msw-devtools-plugin/types"
 */
export type { MockChangeType, MockUpdateEvent, MswDevToolAdapter } from "./adapter/types";
export type { WorkerOptions } from "./msw/worker-manager";
export type {
  GraphQLMockDescriptor,
  GraphQLOperationType,
  HandlerVariant,
  MockOperationDescriptor,
  RestMethod,
  RestMockDescriptor,
} from "./registry/types";
export type { MockStoreState, OperationMockConfig, WorkerStatus } from "./store/types";
