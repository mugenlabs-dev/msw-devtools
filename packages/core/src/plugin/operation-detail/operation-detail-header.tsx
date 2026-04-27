import { theme } from "#/plugin/theme";
import { useHover } from "#/plugin/use-hover";

import type { OperationDetailHeaderProps } from "./types";

export const OperationDetailHeader = ({
  config,
  onToggle,
  operationName,
  typeBadge,
}: OperationDetailHeaderProps) => {
  const toggleHover = useHover();

  let toggleBg: string = theme.colors.toggleOff;
  if (config.enabled) {
    toggleBg = toggleHover.isHovered ? "#5be992" : theme.colors.success;
  } else if (toggleHover.isHovered) {
    toggleBg = theme.colors.toggleOffHover;
  }

  return (
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
          background: toggleBg,
          border: "none",
          borderRadius: theme.radius.lg,
          color: config.enabled ? theme.colors.black : theme.colors.textDisabled,
          cursor: "pointer",
          fontSize: theme.fontSize.base,
          fontWeight: 500,
          padding: `${theme.spacing.sm} ${theme.spacing.xl}`,
          transition: "background 0.15s",
        }}
        type="button"
        {...toggleHover.hoverProps}
      >
        {config.enabled ? "Mocked" : "Passthrough"}
      </button>
    </div>
  );
};
