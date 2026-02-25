import { theme } from "#/plugin/theme";

import type { StatusCodeInputProps } from "./types";

export const StatusCodeInput = ({
  config,
  effectiveStatusCode,
  onStatusCodeChange,
  onStatusCodeReset,
  operationName,
}: StatusCodeInputProps) => {
  const statusBorderColor =
    config.statusCode === null ? theme.colors.borderInput : theme.colors.borderActive;
  return (
    <>
      <span style={{ color: theme.colors.border, margin: `0 ${theme.spacing.sm}` }}>|</span>
      <label
        htmlFor={`status-${operationName}`}
        style={{
          color: theme.colors.textSecondary,
          fontSize: theme.fontSize.md,
          fontWeight: 600,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        Status
      </label>
      <input
        id={`status-${operationName}`}
        max={599}
        min={100}
        onChange={onStatusCodeChange}
        style={{
          background: theme.colors.surface,
          border: `1px solid ${statusBorderColor}`,
          borderRadius: theme.radius.lg,
          color: theme.colors.textPrimary,
          fontSize: theme.fontSize.base,
          outline: "none",
          padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
          width: "70px",
        }}
        type="number"
        value={effectiveStatusCode}
      />
      {config.statusCode !== null && (
        <button
          onClick={onStatusCodeReset}
          style={{
            background: "none",
            border: "none",
            color: theme.colors.borderActive,
            cursor: "pointer",
            fontSize: theme.fontSize.sm,
            padding: 0,
          }}
          type="button"
        >
          Reset
        </button>
      )}
    </>
  );
};
