import { theme } from "#/plugin/theme";

import type { WorkerStatusBarProps } from "./types";

export const WorkerStatusBar = ({
  clearSeenOperations,
  seenOperations,
  status,
  workerStatus,
}: WorkerStatusBarProps) => (
  <div
    style={{
      alignItems: "center",
      background: status.bg,
      borderBottom: `1px solid ${theme.colors.border}`,
      display: "flex",
      justifyContent: "space-between",
      padding: `${theme.spacing.md} ${theme.spacing.xl}`,
    }}
  >
    <div style={{ alignItems: "center", display: "flex", gap: theme.spacing.md }}>
      <span
        style={{
          background: status.color,
          borderRadius: theme.radius.round,
          boxShadow: workerStatus === "active" ? `0 0 6px ${status.color}` : "none",
          display: "inline-block",
          height: "8px",
          width: "8px",
        }}
      />
      <span
        style={{
          color: status.color,
          fontSize: theme.fontSize.md,
          fontWeight: 600,
        }}
      >
        {status.label}
      </span>
    </div>
    {seenOperations.size > 0 && (
      <button
        onClick={clearSeenOperations}
        style={{
          background: "transparent",
          border: `1px solid ${theme.colors.borderInput}`,
          borderRadius: theme.radius.md,
          color: theme.colors.textSecondary,
          cursor: "pointer",
          fontSize: theme.fontSize.sm,
          padding: `1px ${theme.spacing.md}`,
        }}
        type="button"
      >
        Clear seen
      </button>
    )}
  </div>
);
