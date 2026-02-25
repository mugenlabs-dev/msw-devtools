import { useCallback, useMemo } from "react";

import { dispatchMockUpdate } from "#/adapter/event-bus";
import { theme } from "#/plugin/theme";
import type { MockOperationDescriptor } from "#/registry/types";
import { useMockStore } from "#/store/store";
import { OperationRow } from "./operation-row";
import type { GroupedOperationListProps } from "./types";
import { buildGroups } from "./utils";

export const GroupedOperationList = ({
  descriptors,
  grouped,
  operations,
  seenOperations,
  selectedOperation,
  onSelectOperation,
  setEnabled,
}: GroupedOperationListProps) => {
  const collapsedGroups = useMockStore((s) => s.collapsedGroups);
  const toggleGroupCollapsed = useMockStore((s) => s.toggleGroupCollapsed);

  const groups = useMemo(() => buildGroups(descriptors), [descriptors]);

  const hasNamedGroups = grouped && groups.some((g) => g.name !== null);

  const renderRow = useCallback(
    (descriptor: MockOperationDescriptor) => {
      const config = operations[descriptor.operationName];
      const isEnabled = config?.enabled ?? false;
      const variant = descriptor.variants.find((v) => v.id === config?.activeVariantId);
      const hasErrorOverride = config?.errorOverride != null;
      return (
        <OperationRow
          descriptor={descriptor}
          isEnabled={isEnabled}
          isErrorVariant={hasErrorOverride}
          isSeen={seenOperations.has(descriptor.operationName)}
          isSelected={selectedOperation === descriptor.operationName}
          key={descriptor.operationName}
          onSelect={() => {
            onSelectOperation(descriptor.operationName);
          }}
          onToggle={() => {
            setEnabled(descriptor.operationName, !isEnabled);
            dispatchMockUpdate(descriptor.operationName, "toggle");
          }}
          variantLabel={isEnabled && variant ? variant.label : undefined}
        />
      );
    },
    [operations, seenOperations, selectedOperation, onSelectOperation, setEnabled]
  );
  // If grouping is off or no named groups exist, render flat list
  if (!hasNamedGroups) {
    return <div style={{ flex: 1, overflow: "auto" }}>{descriptors.map(renderRow)}</div>;
  }

  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      {groups.map((group) => {
        if (group.name === null) {
          return group.items.map(renderRow);
        }

        const isCollapsed = collapsedGroups.has(group.name);
        return (
          <div key={group.name}>
            <button
              onClick={() => {
                if (group.name != null && group.name !== "") {
                  toggleGroupCollapsed(group.name);
                }
              }}
              style={{
                alignItems: "center",
                background: theme.colors.surfaceGroupHeader,
                border: "none",
                borderBottom: `1px solid ${theme.colors.border}`,
                cursor: "pointer",
                display: "flex",
                gap: theme.spacing.md,
                padding: `5px ${theme.spacing.xl}`,
                textAlign: "left",
                width: "100%",
              }}
              type="button"
            >
              <span
                style={{
                  color: theme.colors.textSecondary,
                  display: "inline-block",
                  fontSize: "8px",
                  transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)",
                  transition: "transform 0.15s",
                }}
              >
                ▼
              </span>
              <span
                style={{
                  color: theme.colors.textSecondary,
                  fontSize: theme.fontSize.sm,
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                {group.name}
              </span>
              <span
                style={{
                  color: theme.colors.textDimmed,
                  fontSize: theme.fontSize.xs,
                  marginLeft: "auto",
                }}
              >
                {group.items.length}
              </span>
            </button>
            {!isCollapsed && group.items.map(renderRow)}
          </div>
        );
      })}
    </div>
  );
};
