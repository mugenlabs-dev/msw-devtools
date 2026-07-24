import { Debouncer } from "@tanstack/pacer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AlertCircle, RotateCcw } from "./icons";
import { theme } from "./theme";
import { useHover } from "./use-hover";

interface JsonEditorProps {
  hasOverride: boolean;
  onChange: (json: string) => void;
  onReset: () => void;
  value: string;
}

const DEBOUNCE_WAIT = 600;

export const JsonEditor = ({ value, onChange, onReset, hasOverride }: JsonEditorProps) => {
  const [localValue, setLocalValue] = useState(value);
  const [isValid, setIsValid] = useState(true);
  // Tracks unsaved keystrokes not yet committed via the debounced onChange, so
  // that incoming captured-data updates don't clobber what the user is typing.
  const isEditingRef = useRef(false);
  const resetHover = useHover();

  const debouncer = useMemo(
    () =>
      new Debouncer(
        (json: string) => {
          onChange(json);
        },
        { wait: DEBOUNCE_WAIT }
      ),
    [onChange]
  );

  useEffect(
    () => () => {
      debouncer.cancel();
    },
    [debouncer]
  );

  useEffect(() => {
    // Once the external value catches up with the local edits (the debounced
    // commit landed), or there is nothing pending, editing is done.
    if (value === localValue) {
      isEditingRef.current = false;
      return;
    }
    // Preserve unsaved keystrokes instead of overwriting them with incoming
    // captured-data changes.
    if (isEditingRef.current) {
      return;
    }
    setLocalValue(value);
    setIsValid(true);
    debouncer.cancel();
  }, [value, localValue, debouncer]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      isEditingRef.current = true;
      setLocalValue(newValue);

      try {
        JSON.parse(newValue);
        setIsValid(true);
        debouncer.maybeExecute(newValue);
      } catch {
        setIsValid(false);
        debouncer.cancel();
      }
    },
    [debouncer]
  );

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        gap: theme.spacing.md,
        minHeight: 0,
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            color: theme.colors.textLabel,
            fontSize: theme.fontSize.md,
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Response JSON {hasOverride && "(custom)"}
        </span>
        <div style={{ display: "flex", gap: theme.spacing.md }}>
          {!isValid && (
            <span
              style={{
                alignItems: "center",
                color: theme.colors.error,
                display: "inline-flex",
                fontSize: theme.fontSize.md,
                fontWeight: 500,
                gap: theme.spacing.xs,
              }}
            >
              <AlertCircle size={13} /> Invalid JSON
            </span>
          )}
          {hasOverride && (
            <button
              onClick={onReset}
              style={{
                alignItems: "center",
                background: resetHover.isHovered
                  ? theme.colors.surfaceHoverStrong
                  : theme.colors.surfaceHover,
                border: `1px solid ${theme.colors.borderInput}`,
                borderRadius: theme.radius.md,
                color: theme.colors.textDisabled,
                cursor: "pointer",
                display: "inline-flex",
                fontSize: theme.fontSize.md,
                gap: theme.spacing.xs,
                padding: `${theme.spacing.xs} ${theme.spacing.lg}`,
                transition: "background 0.15s",
              }}
              type="button"
              {...resetHover.hoverProps}
            >
              <RotateCcw size={12} /> Reset to Default
            </button>
          )}
        </div>
      </div>
      <textarea
        onChange={handleChange}
        spellCheck={false}
        style={{
          background: theme.colors.surface,
          border: `1px solid ${isValid ? theme.colors.border : theme.colors.error}`,
          borderRadius: theme.radius.lg,
          color: theme.colors.textPrimary,
          flex: 1,
          fontFamily: theme.fontFamily.mono,
          fontSize: theme.fontSize.base,
          lineHeight: "1.5",
          minHeight: "120px",
          outline: "none",
          padding: theme.spacing.lg,
          resize: "vertical",
        }}
        value={localValue}
      />
    </div>
  );
};
