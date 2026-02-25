import type { MockOperationDescriptor } from "#/registry/types";
import type { FilterOption, SortOption, WorkerStatus } from "#/store/types";

export type { FilterOption, SortOption } from "#/store/types";

export interface OperationListProps {
  onSelectOperation: (operationName: string) => void;
  selectedOperation: string | null;
}

export interface OperationRowProps {
  descriptor: MockOperationDescriptor;
  isEnabled: boolean;
  isErrorVariant: boolean | undefined;
  isSeen: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onToggle: () => void;
  variantLabel: string | undefined;
}

export interface GroupedOperationListProps {
  descriptors: MockOperationDescriptor[];
  grouped: boolean;
  onSelectOperation: (operationName: string) => void;
  operations: Record<
    string,
    { activeVariantId: string; enabled: boolean; errorOverride?: unknown }
  >;
  seenOperations: Set<string>;
  selectedOperation: string | null;
  setEnabled: (operationName: string, enabled: boolean) => void;
}

export interface WorkerStatusBarProps {
  clearSeenOperations: () => void;
  seenOperations: Set<string>;
  status: { bg: string; color: string; label: string };
  workerStatus: WorkerStatus;
}

export interface ControlsBarProps {
  descriptorCount: number;
  enabledCount: number;
  onDisableAll: () => void;
  onEnableAll: () => void;
}

export interface FilterButtonProps {
  isActive: boolean;
  onClick: () => void;
  opt: string;
}

export interface FilterSortBarProps {
  filter: FilterOption;
  isGrouped: boolean;
  onFilterChange: (opt: FilterOption) => void;
  onGroupToggle: () => void;
  onSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  sort: SortOption;
}
