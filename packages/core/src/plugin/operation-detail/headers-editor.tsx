import { theme } from "#/plugin/theme";

import type { HeadersEditorProps } from "./types";

export const HeadersEditor = ({
  effectiveHeaders,
  hasHeadersOverride,
  onHeadersChange,
  onHeadersReset,
  operationName,
}: HeadersEditorProps) => (
  <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
    <div
      style={{
        alignItems: "center",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <label
        htmlFor={`headers-${operationName}`}
        style={{
          color: theme.colors.textSecondary,
          fontSize: theme.fontSize.md,
          fontWeight: 600,
          textTransform: "uppercase",
        }}
      >
        Headers
      </label>
      {hasHeadersOverride && (
        <button
          onClick={onHeadersReset}
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
    </div>
    <textarea
      id={`headers-${operationName}`}
      onChange={onHeadersChange}
      rows={3}
      spellCheck={false}
      style={{
        background: theme.colors.surface,
        border: `1px solid ${hasHeadersOverride ? theme.colors.borderActive : theme.colors.borderInput}`,
        borderRadius: theme.radius.lg,
        color: theme.colors.textPrimary,
        fontFamily: "monospace",
        fontSize: theme.fontSize.md,
        outline: "none",
        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
        resize: "vertical",
      }}
      value={effectiveHeaders}
    />
  </div>
);
