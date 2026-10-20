import { MoonIcon } from "./components/icons/moon";
import { SunIcon } from "./components/icons/sun";
import { useTheme } from "./theme-context";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="hit-44 pressable ms-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border-primary bg-bg-tertiary text-text-muted transition-[color,background,border-color] duration-150 hover:text-text-secondary"
      onClick={toggleTheme}
      type="button"
    >
      {/* Both icons render; styles.css shows the one for the current data-theme from first paint. */}
      <SunIcon aria-hidden className="theme-icon-sun icon-flex-none flex size-[1cap]" size={15} />
      <MoonIcon aria-hidden className="theme-icon-moon icon-flex-none flex size-[1cap]" size={15} />
    </button>
  );
};
