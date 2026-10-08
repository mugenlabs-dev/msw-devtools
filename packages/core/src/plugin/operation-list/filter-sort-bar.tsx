import { ArrowUpDown, Layers } from "#/plugin/icons";
import { focusableInputStyle, theme, transition } from "#/plugin/theme";
import { useHover } from "#/plugin/use-hover";

import type { FilterButtonProps, FilterSortBarProps } from "./types";

const FilterButton = ({ isActive, onClick, opt }: FilterButtonProps) => {
  const { hoverProps, isHovered } = useHover();

  let bg = "transparent";
  if (isActive) {
    bg = isHovered ? theme.colors.accentBgHover : theme.colors.accentBg;
  } else if (isHovered) {
    bg = theme.colors.surfaceHover;
  }

  return (
    <button
      aria-pressed={isActive}
      onClick={onClick}
      style={{
        background: bg,
        border: `1px solid ${theme.colors.borderInput}`,
        borderRadius: theme.radius.md,
        color: isActive ? theme.colors.accentLight : theme.colors.textSecondary,
        cursor: "pointer",
        fontSize: theme.fontSize.sm,
        fontWeight: isActive ? 600 : 400,
        padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
        textTransform: "capitalize",
        transition: transition("background"),
      }}
      type="button"
      {...hoverProps}
    >
      {opt}
    </button>
  );
};

export const FilterSortBar = ({
  filter,
  isGrouped,
  onFilterChange,
  onGroupToggle,
  onSortChange,
  sort,
}: FilterSortBarProps) => {
  const groupHover = useHover();

  let groupBg = "transparent";
  if (isGrouped) {
    groupBg = groupHover.isHovered ? theme.colors.accentBgHover : theme.colors.accentBg;
  } else if (groupHover.isHovered) {
    groupBg = theme.colors.surfaceHover;
  }

  return (
    <div
      style={{
        borderBottom: `1px solid ${theme.colors.border}`,
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing.lg,
        padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing.lg }}>
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
      <div style={{ alignItems: "center", display: "flex", gap: theme.spacing.lg }}>
        <ArrowUpDown color={theme.colors.textMuted} size={12} />
        <select
          aria-label="Sort operations"
          data-msw-dt-input=""
          onChange={onSortChange}
          style={{
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.borderInput}`,
            borderRadius: theme.radius.md,
            color: theme.colors.textPrimary,
            cursor: "pointer",
            fontSize: theme.fontSize.sm,
            ...focusableInputStyle,
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
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
            background: groupBg,
            border: `1px solid ${theme.colors.borderInput}`,
            borderRadius: theme.radius.md,
            color: isGrouped ? theme.colors.accentLight : theme.colors.textSecondary,
            cursor: "pointer",
            display: "inline-flex",
            fontSize: theme.fontSize.sm,
            fontWeight: isGrouped ? 600 : 400,
            gap: theme.spacing.xs,
            marginLeft: "auto",
            padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
            transition: transition("background"),
          }}
          title={isGrouped ? "Show flat list" : "Show grouped"}
          type="button"
          {...groupHover.hoverProps}
        >
          <Layers size={12} /> Group
        </button>
      </div>
    </div>
  );
};
