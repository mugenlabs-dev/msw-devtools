import { theme } from "#/plugin/theme";

import type { OperationDetailHeaderProps } from "./types";

export const OperationDetailHeader = ({
  config,
  onToggle,
  operationName,
  typeBadge,
}: OperationDetailHeaderProps) => (
  <div
    style={{
      alignItems: "center",
      display: "flex",
      justifyContent: "space-between",
    }}
  >
    <div>
      <span
        style={{ color: theme.colors.textPrimary, fontSize: theme.fontSize.xl, fontWeight: 600 }}
      >
        {operationName}
      </span>
      <span
        style={{
          background: typeBadge.bg,
          borderRadius: theme.radius.md,
          color: typeBadge.color,
          fontSize: theme.fontSize.sm,
          fontWeight: 600,
          marginLeft: theme.spacing.lg,
          padding: `${theme.spacing.xs} ${theme.spacing.md}`,
          textTransform: "uppercase",
        }}
      >
        {typeBadge.label}
      </span>
    </div>
    <button
      aria-label="Toggle mock"
      aria-pressed={config.enabled}
      onClick={onToggle}
      style={{
        background: config.enabled ? theme.colors.success : theme.colors.toggleOff,
        border: "none",
        borderRadius: theme.radius.lg,
        color: config.enabled ? theme.colors.black : "#ccc",
        cursor: "pointer",
        fontSize: theme.fontSize.base,
        fontWeight: 500,
        padding: `${theme.spacing.sm} ${theme.spacing.xl}`,
      }}
      type="button"
    >
      {config.enabled ? "Mocked" : "Passthrough"}
    </button>
  </div>
);
