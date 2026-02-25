export type FilterOption = "all" | "live" | "enabled" | "rest" | "graphql";
export type SortOption = "default" | "a-z" | "z-a";

/** Error override: a common HTTP error status or a network failure. */
export type ErrorOverride = 401 | 404 | 429 | 500 | "networkError" | null;

export interface OperationMockConfig {
  activeVariantId: string;
  /** Custom headers override as JSON string. null = use handler default. */
  customHeaders: string | null;
  /** Custom JSON body override. null = use handler response. */
  customJsonOverride: string | null;
  /** Response delay in milliseconds. 0 = no delay. */
  delay: number;
  enabled: boolean;
  /** When set, the handler resolver is NOT called — a generic error is returned instead. */
  errorOverride: ErrorOverride;
  /** Status code override. null = use handler default. */
  statusCode: number | null;
}

export type WorkerStatus = "idle" | "starting" | "active" | "error";

export interface MockStoreState {
  /** Response data captured from the last handler execution, keyed by operation name. */
  capturedResponseData: Map<string, string>;
  clearSeenOperations: () => void;
  /** Group names that are collapsed in the operation list. Persisted to localStorage. */
  collapsedGroups: Set<string>;
  disableAll: () => void;
  enableAll: () => void;
  filter: FilterOption;
  isGrouped: boolean;
  markOperationSeen: (operationName: string) => void;
  operations: Record<string, OperationMockConfig>;
  seenOperations: Set<string>;
  setActiveVariant: (operationName: string, variantId: string) => void;
  setCapturedResponse: (operationName: string, json: string) => void;
  setCustomHeaders: (operationName: string, headers: string | null) => void;
  setCustomJsonOverride: (operationName: string, json: string | null) => void;
  setDelay: (operationName: string, delay: number) => void;
  setEnabled: (operationName: string, enabled: boolean) => void;
  setErrorOverride: (operationName: string, override: ErrorOverride) => void;
  setFilter: (filter: FilterOption) => void;
  setIsGrouped: (isGrouped: boolean) => void;
  setSort: (sort: SortOption) => void;
  setStatusCode: (operationName: string, statusCode: number | null) => void;
  setWorkerStatus: (status: WorkerStatus) => void;
  sort: SortOption;
  syncWithRegistry: (operationNames: string[]) => void;
  toggleGroupCollapsed: (group: string) => void;
  workerStatus: WorkerStatus;
}
