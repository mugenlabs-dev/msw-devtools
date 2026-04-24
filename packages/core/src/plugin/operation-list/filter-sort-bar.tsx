import { ArrowUpDown, Layers } from "#/plugin/icons";
import { theme } from "#/plugin/theme";

import type { FilterButtonProps, FilterSortBarProps } from "./types";

const FilterButton = ({ isActive, onClick, opt }: FilterButtonProps) => (
  <button
    aria-pressed={isActive}
    onClick={onClick}
    style={{
      background: isActive ? theme.colors.accentBg : "transparent",
      border: `1px solid ${theme.colors.borderInput}`,
      borderRadius: theme.radius.md,
      color: isActive ? theme.colors.accentLight : theme.colors.textSecondary,
      cursor: "pointer",
      fontSize: theme.fontSize.sm,
      fontWeight: isActive ? 600 : 400,
      padding: `${theme.spacing.xs} ${theme.spacing.lg}`,
      textTransform: "capitalize",
    }}
    type="button"
  >
    {opt}
  </button>
);

export const FilterSortBar = ({
  filter,
  isGrouped,
  onFilterChange,
  onGroupToggle,
  onSortChange,
  sort,
}: FilterSortBarProps) => (
  <div
    style={{
      borderBottom: `1px solid ${theme.colors.border}`,
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing.md,
      padding: `${theme.spacing.md} ${theme.spacing.xl}`,
    }}
  >
    <div style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing.sm }}>
      {(["all", "live", "enabled", "rest", "graphql"] as const).map((opt) => (
        <FilterButton
          isActive={filter === opt}
          key={opt}
          onClick={() => {
            onFilterChange(opt);
          }}
          opt={opt}
        />
      ))}
    </div>
    <div style={{ alignItems: "center", display: "flex", gap: theme.spacing.md }}>
      <ArrowUpDown color={theme.colors.textMuted} size={12} />
      <select
        onChange={onSortChange}
        style={{
          background: theme.colors.surface,
          border: `1px solid ${theme.colors.borderInput}`,
          borderRadius: theme.radius.md,
          color: theme.colors.textPrimary,
          fontSize: theme.fontSize.sm,
          outline: "none",
          padding: `${theme.spacing.xs} ${theme.spacing.md}`,
        }}
        value={sort}
      >
        <option value="default">Default</option>
        <option value="a-z">A → Z</option>
        <option value="z-a">Z → A</option>
      </select>
      <button
        aria-pressed={isGrouped}
        data-testid="group-toggle"
        onClick={onGroupToggle}
        style={{
          alignItems: "center",
          background: isGrouped ? theme.colors.accentBg : "transparent",
          border: `1px solid ${theme.colors.borderInput}`,
          borderRadius: theme.radius.md,
          color: isGrouped ? theme.colors.accentLight : theme.colors.textSecondary,
          cursor: "pointer",
          display: "inline-flex",
          fontSize: theme.fontSize.sm,
          fontWeight: isGrouped ? 600 : 400,
          gap: theme.spacing.xs,
          marginLeft: "auto",
          padding: `${theme.spacing.xs} ${theme.spacing.lg}`,
        }}
        title={isGrouped ? "Show flat list" : "Show grouped"}
        type="button"
      >
        <Layers size={12} /> Group
      </button>
    </div>
  </div>
);
