import type { ReactElement } from "react";
import { useCallback } from "react";
import { theme } from "#/plugin/theme";

import type { OperationRowProps } from "./types";

import { getOperationTypeBadge, getStatusDotColor } from "./utils";

export const OperationRow = ({
  descriptor,
  isSelected,
  isEnabled,
  isErrorVariant,
  isSeen,
  variantLabel,
  onSelect,
  onToggle,
}: OperationRowProps): ReactElement => {
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect();
      }
    },
    [onSelect]
  );

  const onToggleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggle();
    },
    [onToggle]
  );

  return (
    // biome-ignore lint/a11y/useSemanticElements: contains nested interactive toggle button
    <div
      aria-label={descriptor.operationName}
      data-testid="operation-row"
      onClick={onSelect}
      onKeyDown={onKeyDown}
      role="button"
      style={{
        alignItems: "center",
        background: isSelected ? theme.colors.surfaceSelected : "transparent",
        borderLeft: isSelected
          ? `2px solid ${theme.colors.borderSelected}`
          : "2px solid transparent",
        cursor: "pointer",
        display: "flex",
        gap: theme.spacing.lg,
        padding: `${theme.spacing.md} ${theme.spacing.xl}`,
      }}
      tabIndex={0}
    >
      <span
        style={{
          background: getStatusDotColor(isEnabled, isErrorVariant),
          borderRadius: theme.radius.round,
          flexShrink: 0,
          height: "8px",
          width: "8px",
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            alignItems: "center",
            color: theme.colors.textPrimary,
            display: "flex",
            fontSize: theme.fontSize.base,
            gap: theme.spacing.md,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {descriptor.operationName}
          {isSeen && (
            <span
              style={{
                background: theme.colors.info,
                borderRadius: theme.radius.sm,
                color: theme.colors.white,
                flexShrink: 0,
                fontSize: theme.fontSize.xs,
                fontWeight: 600,
                lineHeight: "16px",
                padding: `0px ${theme.spacing.sm}`,
              }}
            >
              LIVE
            </span>
          )}
        </div>
        <div
          style={{
            alignItems: "center",
            color: theme.colors.textMuted,
            display: "flex",
            fontSize: theme.fontSize.sm,
            gap: theme.spacing.sm,
          }}
        >
          <span
            style={{
              background:
                descriptor.type === "graphql" ? theme.colors.graphqlBg : theme.colors.restBg,
              borderRadius: theme.radius.sm,
              color: descriptor.type === "graphql" ? theme.colors.graphql : theme.colors.rest,
              fontSize: theme.fontSize.xs,
              fontWeight: 600,
              lineHeight: "14px",
              padding: `0px ${theme.spacing.sm}`,
              textTransform: "uppercase",
            }}
          >
            {descriptor.type === "graphql" ? "graphql" : "rest"}
          </span>
          <span>
            {getOperationTypeBadge(descriptor)}
            {isEnabled && variantLabel != null && variantLabel !== "" ? ` · ${variantLabel}` : ""}
          </span>
        </div>
      </div>
      <button
        aria-label={`Toggle ${descriptor.operationName} mock`}
        aria-pressed={isEnabled}
        onClick={onToggleClick}
        style={{
          background: isEnabled ? theme.colors.success : theme.colors.toggleOff,
          border: "none",
          borderRadius: theme.radius.pill,
          cursor: "pointer",
          flexShrink: 0,
          height: "20px",
          position: "relative",
          transition: "background 0.15s",
          width: "36px",
        }}
        type="button"
      >
        <span
          style={{
            background: theme.colors.white,
            borderRadius: theme.radius.round,
            height: "16px",
            left: isEnabled ? "18px" : "2px",
            position: "absolute",
            top: "2px",
            transition: "left 0.15s",
            width: "16px",
          }}
        />
      </button>
    </div>
  );
};
