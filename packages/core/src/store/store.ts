import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

import type {
  ErrorOverride,
  FilterOption,
  MockStoreState,
  OperationMockConfig,
  SortOption,
} from "./types";

export const defaultConfig: OperationMockConfig = {
  activeVariantId: "variant-0",
  customHeaders: null,
  customJsonOverride: null,
  delay: 0,
  enabled: false,
  errorOverride: null,
  statusCode: null,
};

const FILTER_OPTIONS: readonly FilterOption[] = ["all", "live", "enabled", "rest", "graphql"];
const SORT_OPTIONS: readonly SortOption[] = ["default", "a-z", "z-a"];
const ERROR_OVERRIDES: readonly ErrorOverride[] = [401, 404, 429, 500, "networkError", null];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isOneOf = <T>(options: readonly T[], value: unknown): value is T =>
  options.includes(value as T);

/**
 * Coerce a persisted operation config into a valid {@link OperationMockConfig},
 * dropping fields with the wrong shape and migrating legacy values.
 */
const sanitizeOperationConfig = (value: unknown): OperationMockConfig => {
  if (!isRecord(value)) {
    return { ...defaultConfig };
  }
  const activeVariantId =
    typeof value.activeVariantId === "string"
      ? value.activeVariantId
      : defaultConfig.activeVariantId;
  return {
    // Migrate the pre-variant "success" id to the first variant
    activeVariantId: activeVariantId === "success" ? "variant-0" : activeVariantId,
    customHeaders: typeof value.customHeaders === "string" ? value.customHeaders : null,
    customJsonOverride:
      typeof value.customJsonOverride === "string" ? value.customJsonOverride : null,
    delay: typeof value.delay === "number" && value.delay >= 0 ? value.delay : defaultConfig.delay,
    enabled: typeof value.enabled === "boolean" ? value.enabled : defaultConfig.enabled,
    errorOverride: isOneOf(ERROR_OVERRIDES, value.errorOverride) ? value.errorOverride : null,
    statusCode: typeof value.statusCode === "number" ? value.statusCode : null,
  };
};

export interface PersistedMockState {
  collapsedGroups: string[];
  filter: FilterOption;
  isGrouped: boolean;
  operations: Record<string, OperationMockConfig>;
  sort: SortOption;
}

/**
 * @internal — Validate whatever came out of storage before it reaches the
 * store. Corrupt or hand-edited localStorage must never throw at import time,
 * because that would take down the host application. Not part of the public API.
 */
export const sanitizePersistedState = (
  persisted: unknown,
  fallback: PersistedMockState
): PersistedMockState => {
  if (!isRecord(persisted)) {
    return fallback;
  }
  const operations: Record<string, OperationMockConfig> = {};
  if (isRecord(persisted.operations)) {
    for (const [name, config] of Object.entries(persisted.operations)) {
      operations[name] = sanitizeOperationConfig(config);
    }
  }
  return {
    collapsedGroups: Array.isArray(persisted.collapsedGroups)
      ? persisted.collapsedGroups.filter((group): group is string => typeof group === "string")
      : fallback.collapsedGroups,
    filter: isOneOf(FILTER_OPTIONS, persisted.filter) ? persisted.filter : fallback.filter,
    isGrouped: typeof persisted.isGrouped === "boolean" ? persisted.isGrouped : fallback.isGrouped,
    operations: { ...fallback.operations, ...operations },
    sort: isOneOf(SORT_OPTIONS, persisted.sort) ? persisted.sort : fallback.sort,
  };
};

/** Set all operations' enabled flag to the given value. */
const setAllEnabled = (
  set: (fn: (state: MockStoreState) => Partial<MockStoreState>) => void,
  enabled: boolean
): void => {
  set((state) => {
    const operations = { ...state.operations };
    for (const key of Object.keys(operations)) {
      operations[key] = { ...operations[key], enabled };
    }
    return { operations };
  });
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
        ...defaultConfig,
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
        disableAll: () => setAllEnabled(set, false),
        enableAll: () => setAllEnabled(set, true),

        filter: "all" as FilterOption,

        isGrouped: true,

        markOperationSeen: (operationName) => {
          set((state) => {
            if (state.seenOperations.has(operationName)) {
              return state;
            }
            const next = new Set(state.seenOperations);
            next.add(operationName);
            return { seenOperations: next };
          });
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

        syncWithRegistry: (operationNames) => {
          set((state) => {
            const operations = { ...state.operations };
            const nameSet = new Set(operationNames);
            for (const name of operationNames) {
              if (!(name in operations)) {
                operations[name] = { ...defaultConfig };
              }
            }
            for (const key of Object.keys(operations)) {
              if (!nameSet.has(key)) {
                Reflect.deleteProperty(operations, key);
              }
            }
            return { operations };
          });
        },

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

        workerStatus: "idle",
      }),
      {
        merge: (persisted, current) => {
          const sanitized = sanitizePersistedState(persisted, {
            collapsedGroups: [...current.collapsedGroups],
            filter: current.filter,
            isGrouped: current.isGrouped,
            operations: current.operations,
            sort: current.sort,
          });

          return {
            ...current,
            ...sanitized,
            collapsedGroups: new Set(sanitized.collapsedGroups),
          };
        },
        name: "msw-devtools-store",
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
