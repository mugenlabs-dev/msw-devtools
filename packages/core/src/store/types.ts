export type OperationMockConfig = {
	enabled: boolean;
	activeVariantId: string;
	customJsonOverride: string | null;
	/** Response delay in milliseconds. 0 = no delay. */
	delay: number;
	/** Status code override. null = use variant default. */
	statusCode: number | null;
	/** Custom headers override as JSON string. null = use variant default. */
	customHeaders: string | null;
};

export type WorkerStatus = "idle" | "starting" | "active" | "error";

export type MockStoreState = {
	operations: Record<string, OperationMockConfig>;
	workerStatus: WorkerStatus;
	seenOperations: Set<string>;

	setEnabled: (operationName: string, enabled: boolean) => void;
	setActiveVariant: (operationName: string, variantId: string) => void;
	setCustomJsonOverride: (
		operationName: string,
		json: string | null,
	) => void;
	setDelay: (operationName: string, delay: number) => void;
	setStatusCode: (operationName: string, statusCode: number | null) => void;
	setCustomHeaders: (operationName: string, headers: string | null) => void;
	enableAll: () => void;
	disableAll: () => void;
	setWorkerStatus: (status: WorkerStatus) => void;
	markOperationSeen: (operationName: string) => void;
	clearSeenOperations: () => void;
	syncWithRegistry: (operationNames: string[]) => void;
};
