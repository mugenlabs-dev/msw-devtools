import { theme } from "#/plugin/theme";

import type { ControlsBarProps } from "./types";

export const ControlsBar = ({
  descriptorCount,
  enabledCount,
  onDisableAll,
  onEnableAll,
}: ControlsBarProps) => (
  <div
    style={{
      alignItems: "center",
      borderBottom: `1px solid ${theme.colors.border}`,
      display: "flex",
      justifyContent: "space-between",
      padding: `${theme.spacing.md} ${theme.spacing.xl}`,
    }}
  >
    <span style={{ color: theme.colors.textSecondary, fontSize: theme.fontSize.md }}>
      {enabledCount}/{descriptorCount} active
    </span>
    <div style={{ display: "flex", gap: theme.spacing.sm }}>
      <button
        onClick={onEnableAll}
        style={{
          background: theme.colors.successBg,
          border: `1px solid ${theme.colors.borderInput}`,
          borderRadius: theme.radius.md,
          color: theme.colors.success,
          cursor: "pointer",
          fontSize: theme.fontSize.md,
          padding: `${theme.spacing.xs} ${theme.spacing.lg}`,
        }}
        type="button"
      >
        All On
      </button>
      <button
        onClick={onDisableAll}
        style={{
          background: theme.colors.surfaceHover,
          border: `1px solid ${theme.colors.borderInput}`,
          borderRadius: theme.radius.md,
          color: theme.colors.textDisabled,
          cursor: "pointer",
          fontSize: theme.fontSize.md,
          padding: `${theme.spacing.xs} ${theme.spacing.lg}`,
        }}
        type="button"
      >
        All Off
      </button>
    </div>
  </div>
);
