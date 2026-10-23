import type { ReactElement } from "react";
import { memo, useCallback } from "react";
import { theme, transition } from "#/plugin/theme";
import { useHover } from "#/plugin/use-hover";

import type { OperationRowProps } from "./types";

import { getOperationTypeBadge, getStatusDotColor } from "./utils";

const OperationRowComponent = ({
  descriptor,
  isSelected,
  isEnabled,
  isErrorVariant,
  isSeen,
  variantLabel,
  onSelect,
  onToggle,
}: OperationRowProps): ReactElement => {
  const rowHover = useHover();
  const toggleHover = useHover();

  const { operationName } = descriptor;

  const onSelectClick = useCallback(() => {
    onSelect(operationName);
  }, [onSelect, operationName]);

  const onToggleClick = useCallback(() => {
    onToggle(operationName, !isEnabled);
  }, [onToggle, operationName, isEnabled]);

  let rowBg = "transparent";
  if (isSelected) {
    rowBg = theme.colors.surfaceSelected;
  } else if (rowHover.isHovered) {
    rowBg = theme.colors.surfaceHover;
  }

  let toggleBg: string = theme.colors.toggleOff;
  if (isEnabled) {
    toggleBg = toggleHover.isHovered ? theme.colors.successHover : theme.colors.success;
  } else if (toggleHover.isHovered) {
    toggleBg = theme.colors.toggleOffHover;
  }

  return (
    // The select button and the toggle are siblings: interactive elements
    // must not be nested inside one another.
    <div
      data-testid="operation-row"
      style={{
        alignItems: "center",
        background: rowBg,
        borderLeft: isSelected
          ? `2px solid ${theme.colors.borderSelected}`
          : "2px solid transparent",
        display: "flex",
        gap: theme.spacing.lg,
        paddingRight: theme.spacing.xl,
        transition: transition("background"),
      }}
      {...rowHover.hoverProps}
    >
      <button
        aria-current={isSelected ? "true" : undefined}
        aria-label={operationName}
        data-msw-dt-input=""
        onClick={onSelectClick}
        style={{
          alignItems: "center",
          background: "none",
          border: "none",
          color: "inherit",
          cursor: "pointer",
          display: "flex",
          flex: 1,
          font: "inherit",
          gap: theme.spacing.lg,
          minWidth: 0,
          padding: `${theme.spacing.md} 0 ${theme.spacing.md} ${theme.spacing.xl}`,
          textAlign: "left",
        }}
        type="button"
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
              minWidth: 0,
            }}
          >
            <span
              style={{
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {descriptor.operationName}
            </span>
            {isSeen ? (
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
            ) : null}
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
      </button>
      <button
        aria-label={`Toggle ${operationName} mock`}
        aria-pressed={isEnabled}
        data-msw-dt-hit=""
        onClick={onToggleClick}
        style={{
          background: toggleBg,
          border: "none",
          borderRadius: theme.radius.pill,
          cursor: "pointer",
          flexShrink: 0,
          height: "20px",
          position: "relative",
          transition: transition("background"),
          width: "36px",
        }}
        type="button"
        {...toggleHover.hoverProps}
      >
        <span
          data-msw-dt-motion=""
          style={{
            background: theme.colors.white,
            borderRadius: theme.radius.round,
            height: "16px",
            left: isEnabled ? "18px" : "2px",
            position: "absolute",
            top: "2px",
            transition: transition("left"),
            width: "16px",
          }}
        />
      </button>
    </div>
  );
};

/**
 * Memoised: every store update replaces the whole `operations` record, so
 * without this a single toggle would re-render every row in the list.
 */
export const OperationRow = memo(OperationRowComponent);
