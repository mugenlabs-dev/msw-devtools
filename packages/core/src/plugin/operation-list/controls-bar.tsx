import { ToggleLeft, ToggleRight } from "#/plugin/icons";
import { theme, transition } from "#/plugin/theme";
import { useHover } from "#/plugin/use-hover";

import type { ControlsBarProps } from "./types";

export const ControlsBar = ({
  descriptorCount,
  enabledCount,
  onDisableAll,
  onEnableAll,
}: ControlsBarProps) => {
  const onHover = useHover();
  const offHover = useHover();

  return (
    <div
      style={{
        alignItems: "center",
        borderBottom: `1px solid ${theme.colors.border}`,
        display: "flex",
        justifyContent: "space-between",
        padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
      }}
    >
      <span
        style={{
          color: theme.colors.textSecondary,
          fontSize: theme.fontSize.md,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {enabledCount}/{descriptorCount} active
      </span>
      <div style={{ display: "flex", gap: theme.spacing.lg }}>
        <button
          onClick={onEnableAll}
          style={{
            alignItems: "center",
            background: onHover.isHovered ? theme.colors.successBgHover : theme.colors.successBg,
            border: `1px solid ${theme.colors.borderInput}`,
            borderRadius: theme.radius.md,
            color: theme.colors.success,
            cursor: "pointer",
            display: "inline-flex",
            fontSize: theme.fontSize.md,
            gap: theme.spacing.xs,
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            transition: transition("background"),
          }}
          type="button"
          {...onHover.hoverProps}
        >
          <ToggleRight size={14} /> All On
        </button>
        <button
          onClick={onDisableAll}
          style={{
            alignItems: "center",
            background: offHover.isHovered
              ? theme.colors.surfaceHoverStrong
              : theme.colors.surfaceHover,
            border: `1px solid ${theme.colors.borderInput}`,
            borderRadius: theme.radius.md,
            color: theme.colors.textDisabled,
            cursor: "pointer",
            display: "inline-flex",
            fontSize: theme.fontSize.md,
            gap: theme.spacing.xs,
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            transition: transition("background"),
          }}
          type="button"
          {...offHover.hoverProps}
        >
          <ToggleLeft size={14} /> All Off
        </button>
      </div>
    </div>
  );
};
