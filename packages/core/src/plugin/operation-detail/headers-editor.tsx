import { Debouncer } from "@tanstack/pacer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, RotateCcw } from "#/plugin/icons";
import { theme } from "#/plugin/theme";
import { useHover } from "#/plugin/use-hover";

import type { HeadersEditorProps } from "./types";

const DEBOUNCE_WAIT = 600;

/** Headers must be a JSON object; an empty editor means "no override". */
const isValidHeadersJson = (text: string): boolean => {
  if (text.trim() === "") {
    return true;
  }
  try {
    const parsed: unknown = JSON.parse(text);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
  } catch {
    return false;
  }
};

export const HeadersEditor = ({
  effectiveHeaders,
  hasHeadersOverride,
  onHeadersChange,
  onHeadersReset,
  operationName,
}: HeadersEditorProps) => {
  const resetHover = useHover();
  const [localValue, setLocalValue] = useState(effectiveHeaders);
  // Tracks keystrokes not yet committed via the debounced onHeadersChange, so
  // incoming store updates don't clobber what the user is typing.
  const isEditingRef = useRef(false);
  const isValid = useMemo(() => isValidHeadersJson(localValue), [localValue]);

  const debouncer = useMemo(
    () =>
      new Debouncer(
        (headers: string | null) => {
          onHeadersChange(headers);
        },
        { wait: DEBOUNCE_WAIT }
      ),
    [onHeadersChange]
  );

  useEffect(
    () => () => {
      debouncer.cancel();
    },
    [debouncer]
  );

  useEffect(() => {
    if (effectiveHeaders === localValue) {
      isEditingRef.current = false;
      return;
    }
    if (isEditingRef.current) {
      return;
    }
    setLocalValue(effectiveHeaders);
  }, [effectiveHeaders, localValue]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const nextValue = e.target.value;
      isEditingRef.current = true;
      setLocalValue(nextValue);
      // Only valid header objects reach the store; invalid text stays local.
      if (isValidHeadersJson(nextValue)) {
        debouncer.maybeExecute(nextValue.trim() === "" ? null : nextValue);
      } else {
        debouncer.cancel();
      }
    },
    [debouncer]
  );

  const handleReset = useCallback(() => {
    debouncer.cancel();
    isEditingRef.current = false;
    onHeadersReset();
  }, [debouncer, onHeadersReset]);

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
        {hasHeadersOverride ? (
          <button
            onClick={handleReset}
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
        ) : null}
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
        value={localValue}
      />
    </div>
  );
};
