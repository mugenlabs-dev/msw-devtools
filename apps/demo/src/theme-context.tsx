import { play } from "cuelume";
import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { prefersReducedMotion } from "./lib/utils";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: (e?: React.MouseEvent) => void;
}

const STORAGE_KEY = "msw-devtools-demo-theme";

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {
    // no-op default
  },
});

export const useTheme = () => useContext(ThemeContext);

/** Toggle only sets data-theme + color-scheme; tokens live in styles.css. */
const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
};

/**
 * Resolve theme:
 * 1. Saved preference (localStorage) wins if set
 * 2. Else follow prefers-color-scheme when the media query clearly matches
 * 3. Else dark (first-visit default when no preference and no clear system signal)
 */
export const resolveTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "dark";
  }
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      return saved;
    }
  } catch {
    // ignore quota / private mode
  }
  if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "dark";
};

const readDomTheme = (): Theme => {
  const fromDom = document.documentElement.dataset.theme;
  return fromDom === "light" || fromDom === "dark" ? fromDom : resolveTheme();
};

const animateViewTransition = (x: number, y: number) => {
  const maxRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  document.documentElement.animate(
    {
      clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`],
    },
    {
      duration: 500,
      easing: "ease-in-out",
      pseudoElement: "::view-transition-new(root)",
    }
  );
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof document === "undefined" ? "dark" : readDomTheme()
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Follow system only when the user has not saved a preference.
  useEffect(() => {
    const mqLight = window.matchMedia("(prefers-color-scheme: light)");
    const mqDark = window.matchMedia("(prefers-color-scheme: dark)");

    const onChange = () => {
      let saved: string | null = null;
      try {
        saved = window.localStorage.getItem(STORAGE_KEY);
      } catch {
        saved = null;
      }
      if (saved === "light" || saved === "dark") {
        return;
      }
      setTheme(resolveTheme());
    };

    mqLight.addEventListener("change", onChange);
    mqDark.addEventListener("change", onChange);
    return () => {
      mqLight.removeEventListener("change", onChange);
      mqDark.removeEventListener("change", onChange);
    };
  }, []);

  const toggleTheme = useCallback(
    (e?: React.MouseEvent) => {
      const next = theme === "dark" ? "light" : "dark";

      play(next === "light" ? "tick" : "press");

      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }

      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? 0;

      const apply = () => {
        setTheme(next);
        applyTheme(next);
      };

      if (prefersReducedMotion() || typeof document.startViewTransition !== "function") {
        apply();
        return;
      }

      const transition = document.startViewTransition(apply);
      void transition.ready.then(() => {
        animateViewTransition(x, y);
      });
    },
    [theme]
  );

  const contextValue = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};
