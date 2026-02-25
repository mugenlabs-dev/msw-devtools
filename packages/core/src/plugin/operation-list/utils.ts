import { theme } from "#/plugin/theme";
import type { MockOperationDescriptor } from "#/registry/types";
import type { WorkerStatus } from "#/store/types";

import type { FilterOption, SortOption } from "./types";

export const getOperationTypeBadge = (descriptor: MockOperationDescriptor): string => {
  if (descriptor.type === "graphql") {
    return descriptor.operationType;
  }
  return descriptor.method.toUpperCase();
};

export const getStatusDotColor = (
  isEnabled: boolean,
  isErrorVariant: boolean | undefined
): string => {
  if (!isEnabled) {
    return theme.colors.textDimmed;
  }
  if (isErrorVariant === true) {
    return theme.colors.error;
  }
  return theme.colors.success;
};

export const statusConfig: Record<WorkerStatus, { bg: string; color: string; label: string }> = {
  active: { bg: theme.colors.successBg, color: theme.colors.success, label: "MSW Active" },
  error: { bg: theme.colors.errorBg, color: theme.colors.error, label: "MSW Error" },
  idle: { bg: theme.colors.surfaceHover, color: theme.colors.textSecondary, label: "MSW Idle" },
  starting: { bg: theme.colors.warningBg, color: theme.colors.warning, label: "Starting..." },
};

/** Group descriptors by their group key into a Map. */
const groupDescriptorsByKey = (
  descriptors: MockOperationDescriptor[]
): Map<string | null, MockOperationDescriptor[]> => {
  const groupMap = new Map<string | null, MockOperationDescriptor[]>();
  for (const d of descriptors) {
    const key = d.group ?? null;
    if (!groupMap.has(key)) {
      groupMap.set(key, []);
    }
    groupMap.get(key)?.push(d);
  }
  return groupMap;
};

/** Convert a grouped map into an ordered array with ungrouped items first. */
const mapToOrderedGroups = (
  groupMap: Map<string | null, MockOperationDescriptor[]>
): { items: MockOperationDescriptor[]; name: string | null }[] => {
  const result: { items: MockOperationDescriptor[]; name: string | null }[] = [];
  const ungrouped = groupMap.get(null);
  if (ungrouped) {
    result.push({ items: ungrouped, name: null });
  }
  for (const [key, items] of groupMap) {
    if (key !== null) {
      result.push({ items, name: key });
    }
  }
  return result;
};

/** Build groups array from descriptors, with ungrouped items first. */
export const buildGroups = (
  descriptors: MockOperationDescriptor[]
): { items: MockOperationDescriptor[]; name: string | null }[] =>
  mapToOrderedGroups(groupDescriptorsByKey(descriptors));

/** Apply a filter option to descriptors. */
const applyFilter = (
  descriptors: MockOperationDescriptor[],
  operations: Record<string, { enabled: boolean }>,
  seenOperations: Set<string>,
  filter: FilterOption
): MockOperationDescriptor[] => {
  if (filter === "live") {
    return descriptors.filter((d) => seenOperations.has(d.operationName));
  }
  if (filter === "enabled") {
    return descriptors.filter((d) => operations[d.operationName]?.enabled);
  }
  if (filter === "rest") {
    return descriptors.filter((d) => d.type === "rest");
  }
  if (filter === "graphql") {
    return descriptors.filter((d) => d.type === "graphql");
  }
  return descriptors;
};

/** Apply a sort option to descriptors. */
const applySort = (
  list: MockOperationDescriptor[],
  sort: SortOption
): MockOperationDescriptor[] => {
  if (sort === "a-z") {
    return [...list].toSorted((a, b) => a.operationName.localeCompare(b.operationName));
  }
  if (sort === "z-a") {
    return [...list].toSorted((a, b) => b.operationName.localeCompare(a.operationName));
  }
  return list;
};

/** Apply filter and sort to descriptors list. */
export const filterAndSortDescriptors = (
  descriptors: MockOperationDescriptor[],
  operations: Record<string, { enabled: boolean }>,
  seenOperations: Set<string>,
  filter: FilterOption,
  sort: SortOption
): MockOperationDescriptor[] =>
  applySort(applyFilter(descriptors, operations, seenOperations, filter), sort);
