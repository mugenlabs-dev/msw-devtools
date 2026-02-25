import { useCallback, useRef, useSyncExternalStore } from "react";
import { dispatchMockUpdate } from "#/adapter/event-bus";
import { mockRegistry } from "#/registry/registry";
import type { MockOperationDescriptor } from "#/registry/types";
import { useMockStore } from "#/store/store";
import type { FilterOption, SortOption } from "#/store/types";

const subscribeToRegistry = (cb: () => void) => mockRegistry.subscribe(cb);
const getRegistrySnapshot = () => mockRegistry.getAll();
const getRegistryServerSnapshot = () => [] as MockOperationDescriptor[];

export const useRegistryDescriptors = (): MockOperationDescriptor[] =>
  useSyncExternalStore(subscribeToRegistry, getRegistrySnapshot, getRegistryServerSnapshot);

export const useListStoreSelectors = () => ({
  clearSeenOperations: useMockStore((s) => s.clearSeenOperations),
  disableAll: useMockStore((s) => s.disableAll),
  enableAll: useMockStore((s) => s.enableAll),
  operations: useMockStore((s) => s.operations),
  seenOperations: useMockStore((s) => s.seenOperations),
  setEnabled: useMockStore((s) => s.setEnabled),
  workerStatus: useMockStore((s) => s.workerStatus),
});

export const useOperationListState = () => {
  const filter = useMockStore((s) => s.filter);
  const sort = useMockStore((s) => s.sort);
  const isGrouped = useMockStore((s) => s.isGrouped);
  const setFilter = useMockStore((s) => s.setFilter);
  const setSort = useMockStore((s) => s.setSort);
  const setIsGrouped = useMockStore((s) => s.setIsGrouped);

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSort(e.target.value as SortOption);
    },
    [setSort]
  );
  const handleGroupToggle = useCallback(() => {
    setIsGrouped(!isGrouped);
  }, [isGrouped, setIsGrouped]);

  const handleFilterChange = useCallback(
    (opt: FilterOption) => {
      setFilter(opt);
    },
    [setFilter]
  );

  return { filter, handleFilterChange, handleGroupToggle, handleSortChange, isGrouped, sort };
};

export const useBulkActions = (descriptors: MockOperationDescriptor[]) => {
  const enableAll = useMockStore((s) => s.enableAll);
  const disableAll = useMockStore((s) => s.disableAll);
  const descriptorsRef = useRef(descriptors);
  descriptorsRef.current = descriptors;

  const handleEnableAll = useCallback(() => {
    enableAll();
    for (const d of descriptorsRef.current) {
      dispatchMockUpdate(d.operationName, "enable-all");
    }
  }, [enableAll]);

  const handleDisableAll = useCallback(() => {
    disableAll();
    for (const d of descriptorsRef.current) {
      dispatchMockUpdate(d.operationName, "disable-all");
    }
  }, [disableAll]);

  return { handleDisableAll, handleEnableAll };
};
