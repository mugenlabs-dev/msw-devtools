import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { MockStoreState, OperationMockConfig } from "./types";

const defaultConfig: OperationMockConfig = {
	enabled: false,
	activeVariantId: "success",
	customJsonOverride: null,
	delay: 0,
	statusCode: null,
	customHeaders: null,
};

export const useMockStore = create<MockStoreState>()(
	devtools(
		persist(
			(set) => ({
				operations: {},
				workerStatus: "idle",
				seenOperations: new Set<string>(),

				setEnabled: (operationName, enabled) => {
					set((state) => ({
						operations: {
							...state.operations,
							[operationName]: {
								...state.operations[operationName],
								enabled,
							},
						},
					}));
				},

				setActiveVariant: (operationName, variantId) => {
					set((state) => ({
						operations: {
							...state.operations,
							[operationName]: {
								...state.operations[operationName],
								activeVariantId: variantId,
								customJsonOverride: null,
								statusCode: null,
								customHeaders: null,
							},
						},
					}));
				},

				setCustomJsonOverride: (operationName, json) => {
					set((state) => ({
						operations: {
							...state.operations,
							[operationName]: {
								...state.operations[operationName],
								customJsonOverride: json,
							},
						},
					}));
				},

				setDelay: (operationName, delay) => {
					set((state) => ({
						operations: {
							...state.operations,
							[operationName]: {
								...state.operations[operationName],
								delay: Math.max(0, delay),
							},
						},
					}));
				},

				setStatusCode: (operationName, statusCode) => {
					set((state) => ({
						operations: {
							...state.operations,
							[operationName]: {
								...state.operations[operationName],
								statusCode,
							},
						},
					}));
				},

				setCustomHeaders: (operationName, headers) => {
					set((state) => ({
						operations: {
							...state.operations,
							[operationName]: {
								...state.operations[operationName],
								customHeaders: headers,
							},
						},
					}));
				},

				enableAll: () => {
					set((state) => {
						const operations = { ...state.operations };
						for (const key of Object.keys(operations)) {
							operations[key] = { ...operations[key], enabled: true };
						}
						return { operations };
					});
				},

				disableAll: () => {
					set((state) => {
						const operations = { ...state.operations };
						for (const key of Object.keys(operations)) {
							operations[key] = { ...operations[key], enabled: false };
						}
						return { operations };
					});
				},

				setWorkerStatus: (workerStatus) => {
					set({ workerStatus });
				},

				markOperationSeen: (operationName) => {
					set((state) => {
						const next = new Set(state.seenOperations);
						next.add(operationName);
						return { seenOperations: next };
					});
				},

				clearSeenOperations: () => {
					set({ seenOperations: new Set() });
				},

				syncWithRegistry: (operationNames) => {
					set((state) => {
						const operations = { ...state.operations };
						for (const name of operationNames) {
							if (!(name in operations)) {
								operations[name] = { ...defaultConfig };
							}
						}
						for (const key of Object.keys(operations)) {
							if (!operationNames.includes(key)) {
								delete operations[key];
							}
						}
						return { operations };
					});
				},
			}),
			{
				name: "msw-devtool-store",
				partialize: (state) => ({
					operations: state.operations,
				}),
				merge: (persisted, current) => {
					const persistedState = persisted as
						| { operations?: Record<string, OperationMockConfig> }
						| undefined;
					return {
						...current,
						operations: {
							...current.operations,
							...persistedState?.operations,
						},
					};
				},
			},
		),
	),
);

/** Framework-agnostic store access. */
export const mockStore = useMockStore;
