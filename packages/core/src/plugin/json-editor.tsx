import { Debouncer } from "@tanstack/pacer";
import { useCallback, useEffect, useMemo, useState } from "react";

import { theme } from "./theme";

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
    setLocalValue(value);
    setIsValid(true);
    debouncer.cancel();
  }, [value, debouncer]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
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
              style={{ color: theme.colors.error, fontSize: theme.fontSize.md, fontWeight: 500 }}
            >
              Invalid JSON
            </span>
          )}
          {hasOverride && (
            <button
              onClick={onReset}
              style={{
                background: theme.colors.surfaceHover,
                border: `1px solid ${theme.colors.borderInput}`,
                borderRadius: theme.radius.md,
                color: "#ccc",
                cursor: "pointer",
                fontSize: theme.fontSize.md,
                padding: `${theme.spacing.xs} ${theme.spacing.lg}`,
              }}
              type="button"
            >
              Reset to Default
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
