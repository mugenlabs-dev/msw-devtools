import { theme } from "#/plugin/theme";

import type { VariantSelectorProps } from "./types";

export const VariantSelector = ({
  activeVariantId,
  onVariantChange,
  operationName,
  variants,
}: VariantSelectorProps) => (
  <div style={{ alignItems: "center", display: "flex", gap: theme.spacing.lg }}>
    <label
      htmlFor={`variant-${operationName}`}
      style={{
        color: theme.colors.textSecondary,
        fontSize: theme.fontSize.md,
        fontWeight: 600,
        textTransform: "uppercase",
      }}
    >
      Variant
    </label>
    <select
      id={`variant-${operationName}`}
      onChange={onVariantChange}
      style={{
        background: theme.colors.surface,
        border: `1px solid ${theme.colors.borderInput}`,
        borderRadius: theme.radius.lg,
        color: theme.colors.textPrimary,
        flex: 1,
        fontSize: theme.fontSize.base,
        outline: "none",
        padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
      }}
      value={activeVariantId}
    >
      {variants.map((v) => (
        <option key={v.id} value={v.id}>
          {v.label}
        </option>
      ))}
    </select>
  </div>
);
