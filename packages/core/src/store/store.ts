import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import type {
  ErrorOverride,
  FilterOption,
  MockStoreState,
  OperationMockConfig,
  SortOption,
} from "./types";

const defaultConfig: OperationMockConfig = {
  activeVariantId: "variant-0",
  customHeaders: null,
  customJsonOverride: null,
  delay: 0,
  enabled: false,
  errorOverride: null,
  statusCode: null,
};

/** Update a single operation's config fields within the store. */
const updateOperation = (
  set: (fn: (state: MockStoreState) => Partial<MockStoreState>) => void,
  operationName: string,
  update: Partial<OperationMockConfig>
): void => {
  set((state) => ({
    operations: {
      ...state.operations,
      [operationName]: {
        ...state.operations[operationName],
        ...update,
      },
    },
  }));
};

/** @internal — Used by the plugin UI. Not part of the public API. */
export const useMockStore = create<MockStoreState>()(
  devtools(
    persist(
      (set) => ({
        /** Response data captured from handler execution (not persisted). */
        capturedResponseData: new Map<string, string>(),

        clearSeenOperations: () => {
          set({ seenOperations: new Set() });
        },

        collapsedGroups: new Set<string>(),
        disableAll: () => {
          set((state) => {
            const operations = { ...state.operations };
            for (const key of Object.keys(operations)) {
              operations[key] = { ...operations[key], enabled: false };
            }
            return { operations };
          });
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

        filter: "all" as FilterOption,

        isGrouped: true,

        markOperationSeen: (operationName) => {
          set((state) => ({
            seenOperations: new Set([...state.seenOperations, operationName]),
          }));
        },

        operations: {},

        seenOperations: new Set<string>(),

        setActiveVariant: (operationName, variantId) => {
          updateOperation(set, operationName, {
            activeVariantId: variantId,
            customHeaders: null,
            customJsonOverride: null,
            errorOverride: null,
            statusCode: null,
          });
        },

        setCapturedResponse: (operationName, json) => {
          set((state) => {
            const next = new Map(state.capturedResponseData);
            next.set(operationName, json);
            return { capturedResponseData: next };
          });
        },

        setCustomHeaders: (operationName, headers) => {
          updateOperation(set, operationName, { customHeaders: headers });
        },

        setCustomJsonOverride: (operationName, json) => {
          updateOperation(set, operationName, { customJsonOverride: json });
        },

        setDelay: (operationName, delayMs) => {
          updateOperation(set, operationName, { delay: Math.max(0, delayMs) });
        },

        setEnabled: (operationName, enabled) => {
          updateOperation(set, operationName, { enabled });
        },

        setErrorOverride: (operationName, override: ErrorOverride) => {
          updateOperation(set, operationName, { errorOverride: override });
        },

        setFilter: (filter) => {
          set({ filter });
        },

        setIsGrouped: (isGrouped) => {
          set({ isGrouped });
        },

        setSort: (sort) => {
          set({ sort });
        },

        setStatusCode: (operationName, statusCode) => {
          updateOperation(set, operationName, { statusCode });
        },

        setWorkerStatus: (workerStatus) => {
          set({ workerStatus });
        },

        sort: "default" as SortOption,

        toggleGroupCollapsed: (group) => {
          set((state) => {
            const next = new Set(state.collapsedGroups);
            if (next.has(group)) {
              next.delete(group);
            } else {
              next.add(group);
            }
            return { collapsedGroups: next };
          });
        },

        syncWithRegistry: (operationNames) => {
          set((state) => {
            const operations = { ...state.operations };
            for (const name of operationNames) {
              if (name in operations) {
                // Ensure existing persisted configs have new fields with defaults
                const existing = operations[name];
                if (existing.errorOverride === undefined) {
                  operations[name] = { ...existing, errorOverride: null };
                }
              } else {
                operations[name] = { ...defaultConfig };
              }
            }
            for (const key of Object.keys(operations)) {
              if (!operationNames.includes(key)) {
                Reflect.deleteProperty(operations, key);
              }
            }
            return { operations };
          });
        },

        workerStatus: "idle",
      }),
      {
        merge: (persisted, current) => {
          const persistedState = persisted as
            | {
                collapsedGroups?: string[];
                filter?: FilterOption;
                isGrouped?: boolean;
                operations?: Record<string, OperationMockConfig>;
                sort?: SortOption;
              }
            | undefined;

          // Migrate persisted operations: add errorOverride if missing
          const mergedOps = {
            ...current.operations,
            ...persistedState?.operations,
          };
          for (const key of Object.keys(mergedOps)) {
            const op = mergedOps[key];
            if (op.errorOverride === undefined) {
              mergedOps[key] = { ...op, errorOverride: null };
            }
            // Migrate old "success" variant ID to new "variant-0"
            if (op.activeVariantId === "success") {
              mergedOps[key] = { ...mergedOps[key], activeVariantId: "variant-0" };
            }
          }

          return {
            ...current,
            collapsedGroups: persistedState?.collapsedGroups
              ? new Set(persistedState.collapsedGroups)
              : current.collapsedGroups,
            filter: persistedState?.filter ?? current.filter,
            isGrouped: persistedState?.isGrouped ?? current.isGrouped,
            operations: mergedOps,
            sort: persistedState?.sort ?? current.sort,
          };
        },
        name: "msw-devtool-store",
        partialize: (state) => ({
          collapsedGroups: [...state.collapsedGroups],
          filter: state.filter,
          isGrouped: state.isGrouped,
          operations: state.operations,
          sort: state.sort,
        }),
      }
    )
  )
);

/** @internal — Framework-agnostic store access. Not part of the public API. */
export const mockStore = useMockStore;
