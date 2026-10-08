import { play } from "cuelume";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { prefersReducedMotion } from "./lib/utils";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: (e?: React.MouseEvent) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {
    // no-op default
  },
});

export const useTheme = () => useContext(ThemeContext);

/** Toggle only sets data-theme + color-scheme; hex tokens live in styles.css via light-dark(). */
const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
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
  const [theme, setTheme] = useState<Theme>("dark");
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      applyTheme("dark");
      initialized.current = true;
    }
  }, []);

  const toggleTheme = useCallback(
    (e?: React.MouseEvent) => {
      const next = theme === "dark" ? "light" : "dark";

      play(next === "light" ? "tick" : "press");

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
