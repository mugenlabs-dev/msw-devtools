import { useCallback, useState } from "react";
import { AlertCircle, RotateCcw } from "#/plugin/icons";
import { theme } from "#/plugin/theme";
import { useHover } from "#/plugin/use-hover";

import type { HeadersEditorProps } from "./types";

export const HeadersEditor = ({
  effectiveHeaders,
  hasHeadersOverride,
  onHeadersChange,
  onHeadersReset,
  operationName,
}: HeadersEditorProps) => {
  const resetHover = useHover();
  const [isValid, setIsValid] = useState(true);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const nextValue = e.target.value;
      if (nextValue === "") {
        setIsValid(true);
      } else {
        try {
          JSON.parse(nextValue);
          setIsValid(true);
        } catch {
          setIsValid(false);
        }
      }
      onHeadersChange(e);
    },
    [onHeadersChange]
  );

  let borderColor: string = theme.colors.borderInput;
  if (!isValid) {
    borderColor = theme.colors.error;
  } else if (hasHeadersOverride) {
    borderColor = theme.colors.borderActive;
  }

  return (
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
        {!isValid && (
          <span
            style={{
              alignItems: "center",
              color: theme.colors.error,
              display: "inline-flex",
              fontSize: theme.fontSize.sm,
              fontWeight: 500,
              gap: theme.spacing.xs,
              marginLeft: "auto",
              marginRight: theme.spacing.md,
            }}
          >
            <AlertCircle size={12} /> Invalid JSON
          </span>
        )}
        {hasHeadersOverride && (
          <button
            onClick={onHeadersReset}
            style={{
              alignItems: "center",
              background: "none",
              border: "none",
              color: theme.colors.borderActive,
              cursor: "pointer",
              display: "inline-flex",
              fontSize: theme.fontSize.sm,
              gap: theme.spacing.xs,
              opacity: resetHover.isHovered ? 0.7 : 1,
              padding: 0,
              transition: "opacity 0.15s",
            }}
            type="button"
            {...resetHover.hoverProps}
          >
            <RotateCcw size={11} /> Reset
          </button>
        )}
      </div>
      <textarea
        id={`headers-${operationName}`}
        onChange={handleChange}
        rows={3}
        spellCheck={false}
        style={{
          background: theme.colors.surface,
          border: `1px solid ${borderColor}`,
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
};
