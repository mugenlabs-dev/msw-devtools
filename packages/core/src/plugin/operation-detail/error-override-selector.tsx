import { useCallback } from "react";
import { theme } from "#/plugin/theme";
import type { ErrorOverride } from "#/store/types";

const ERROR_OPTIONS: { label: string; value: Exclude<ErrorOverride, null> }[] = [
  { label: "401", value: 401 },
  { label: "404", value: 404 },
  { label: "429", value: 429 },
  { label: "500", value: 500 },
  { label: "Network Error", value: "networkError" },
];

interface ErrorOverrideSelectorProps {
  onChange: (override: ErrorOverride) => void;
  operationName: string;
  value: ErrorOverride;
}

export const ErrorOverrideSelector = ({
  onChange,
  operationName,
  value,
}: ErrorOverrideSelectorProps) => {
  const handleClick = useCallback(
    (option: Exclude<ErrorOverride, null>) => {
      // Toggle: if already active, deselect (set to null)
      onChange(value === option ? null : option);
    },
    [value, onChange]
  );

  return (
    <fieldset
      aria-label={`Error override for ${operationName}`}
      style={{
        border: "none",
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing.sm,
        margin: 0,
        padding: 0,
      }}
    >
      <legend
        style={{
          color: theme.colors.textSecondary,
          fontSize: theme.fontSize.md,
          fontWeight: 600,
          padding: 0,
          textTransform: "uppercase",
        }}
      >
        Error Override
      </legend>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: theme.spacing.sm,
        }}
      >
        {ERROR_OPTIONS.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              aria-label={`Set error override to ${opt.label}`}
              aria-pressed={isActive}
              key={opt.label}
              onClick={() => {
                handleClick(opt.value);
              }}
              style={{
                background: isActive ? theme.colors.errorBg : theme.colors.surface,
                border: `1px solid ${isActive ? theme.colors.error : theme.colors.borderInput}`,
                borderRadius: theme.radius.md,
                color: isActive ? theme.colors.error : theme.colors.textSecondary,
                cursor: "pointer",
                fontSize: theme.fontSize.md,
                fontWeight: isActive ? 600 : 400,
                padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                transition: "all 0.15s",
              }}
              type="button"
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};
