import { useMemo } from "react";
import { theme } from "#/plugin/theme";
import { ControlsBar } from "./controls-bar";
import { FilterSortBar } from "./filter-sort-bar";
import { GroupedOperationList } from "./grouped-operation-list";
import {
  useBulkActions,
  useListStoreSelectors,
  useOperationListState,
  useRegistryDescriptors,
} from "./hooks";
import type { OperationListProps } from "./types";
import { filterAndSortDescriptors, statusConfig } from "./utils";
import { WorkerStatusBar } from "./worker-status-bar";

export const OperationList = ({ selectedOperation, onSelectOperation }: OperationListProps) => {
  const descriptors = useRegistryDescriptors();
  const store = useListStoreSelectors();
  const listState = useOperationListState();
  const { handleEnableAll, handleDisableAll } = useBulkActions(descriptors);

  const filteredDescriptors = useMemo(
    () =>
      filterAndSortDescriptors(
        descriptors,
        store.operations,
        store.seenOperations,
        listState.filter,
        listState.sort
      ),
    [descriptors, store.operations, store.seenOperations, listState.filter, listState.sort]
  );

  const enabledCount = Object.values(store.operations).reduce(
    (count, op) => count + (op.enabled ? 1 : 0),
    0
  );
  const status = statusConfig[store.workerStatus];

  return (
    <div
      style={{
        borderRight: `1px solid ${theme.colors.border}`,
        display: "flex",
        flexDirection: "column",
        minWidth: "280px",
        overflow: "hidden",
        width: "280px",
      }}
    >
      <WorkerStatusBar
        clearSeenOperations={store.clearSeenOperations}
        seenOperations={store.seenOperations}
        status={status}
        workerStatus={store.workerStatus}
      />

      <ControlsBar
        descriptorCount={descriptors.length}
        enabledCount={enabledCount}
        onDisableAll={handleDisableAll}
        onEnableAll={handleEnableAll}
      />

      <FilterSortBar
        filter={listState.filter}
        isGrouped={listState.isGrouped}
        onFilterChange={listState.handleFilterChange}
        onGroupToggle={listState.handleGroupToggle}
        onSortChange={listState.handleSortChange}
        sort={listState.sort}
      />

      <GroupedOperationList
        descriptors={filteredDescriptors}
        grouped={listState.isGrouped}
        onSelectOperation={onSelectOperation}
        operations={store.operations}
        seenOperations={store.seenOperations}
        selectedOperation={selectedOperation}
        setEnabled={store.setEnabled}
      />
    </div>
  );
};
