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

// ---- light-switch click sound helpers ----

interface ToneConfig {
  endFreq: number;
  endTime: number;
  gainVal: number;
  rampTime: number;
  startFreq: number;
  startTime: number;
}

const createSineOsc = (ctx: AudioContext) => {
  const osc = ctx.createOscillator();
  osc.type = "sine";
  return osc;
};

const createGainNode = (ctx: AudioContext, gainVal: number, startTime: number, endTime: number) => {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(gainVal, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, endTime);
  return gain;
};

const playTone = (ctx: AudioContext, config: ToneConfig) => {
  const osc = createSineOsc(ctx);
  const gain = createGainNode(ctx, config.gainVal, config.startTime, config.endTime);
  osc.frequency.setValueAtTime(config.startFreq, config.startTime);
  osc.frequency.exponentialRampToValueAtTime(config.endFreq, config.rampTime);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(config.startTime);
  osc.stop(config.endTime);
};

const playLightModeSound = (ctx: AudioContext, now: number) => {
  // Rising, bright pop for activating light mode
  playTone(ctx, {
    endFreq: 800,
    endTime: now + 0.15,
    gainVal: 0.25,
    rampTime: now + 0.08,
    startFreq: 400,
    startTime: now,
  });
  // Harmonic sparkle
  playTone(ctx, {
    endFreq: 800,
    endTime: now + 0.1,
    gainVal: 0.08,
    rampTime: now + 0.1,
    startFreq: 1200,
    startTime: now + 0.02,
  });
};

const playDarkModeSound = (ctx: AudioContext, now: number) => {
  // Falling, mellow pop for activating dark mode
  playTone(ctx, {
    endFreq: 200,
    endTime: now + 0.15,
    gainVal: 0.25,
    rampTime: now + 0.12,
    startFreq: 500,
    startTime: now,
  });
  // Soft low harmonic
  playTone(ctx, {
    endFreq: 150,
    endTime: now + 0.12,
    gainVal: 0.1,
    rampTime: now + 0.12,
    startFreq: 300,
    startTime: now,
  });
};

// Inspired by joshwcomeau.com — different tones for each direction
let sharedAudioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  try {
    if (sharedAudioCtx == null || sharedAudioCtx.state === "closed") {
      sharedAudioCtx = new AudioContext();
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
};

const playLightSwitchSound = (targetTheme: Theme) => {
  const ctx = getAudioContext();
  if (ctx == null) {
    return;
  }

  // Resume if suspended (browsers suspend until user gesture)
  if (ctx.state === "suspended") {
    void ctx.resume();
  }

  const now = ctx.currentTime;

  if (targetTheme === "light") {
    playLightModeSound(ctx, now);
  } else {
    playDarkModeSound(ctx, now);
  }
};

// ---- CSS variables for each theme ----
const themeVars: Record<Theme, Record<string, string>> = {
  dark: {
    "--accent-blue": "#6cb6ff",
    "--accent-green": "#4ade80",
    "--accent-purple": "#a78bfa",
    "--badge-graphql-bg": "#3a1e5f",
    "--badge-graphql-color": "#a78bfa",
    "--badge-lib-bg": "#1a2a1a",
    "--badge-lib-color": "#4ade80",
    "--badge-method-bg": "#1e3a5f",
    "--badge-method-color": "#60a5fa",
    "--badge-rest-bg": "#1e3a5f",
    "--badge-rest-color": "#60a5fa",
    "--bg-primary": "#0a0a0a",
    "--bg-secondary": "#111",
    "--bg-tertiary": "#1a1a1a",
    "--border-primary": "#222",
    "--border-secondary": "#333",
    "--border-tertiary": "#444",
    "--card-bg": "#111",
    "--code-bg": "rgba(255,255,255,0.06)",
    "--code-block-bg": "#0d1117",
    "--header-bg": "rgba(10, 10, 10, 0.85)",
    "--hero-btn-bg": "#fff",
    "--hero-btn-color": "#000",
    "--pill-bg": "#111",
    "--pill-color": "#aaa",
    "--text-dimmed": "#666",
    "--text-muted": "#888",
    "--text-primary": "#fff",
    "--text-secondary": "#e0e0e0",
    "--text-tertiary": "#aaa",
  },
  light: {
    "--accent-blue": "#2563eb",
    "--accent-green": "#16a34a",
    "--accent-purple": "#7c3aed",
    "--badge-graphql-bg": "#ede9fe",
    "--badge-graphql-color": "#6d28d9",
    "--badge-lib-bg": "#dcfce7",
    "--badge-lib-color": "#15803d",
    "--badge-method-bg": "#dbeafe",
    "--badge-method-color": "#1d4ed8",
    "--badge-rest-bg": "#dbeafe",
    "--badge-rest-color": "#1d4ed8",
    "--bg-primary": "#f8f8f8",
    "--bg-secondary": "#fff",
    "--bg-tertiary": "#eee",
    "--border-primary": "#ddd",
    "--border-secondary": "#ccc",
    "--border-tertiary": "#bbb",
    "--card-bg": "#fff",
    "--code-bg": "rgba(0,0,0,0.05)",
    "--code-block-bg": "#1e293b",
    "--header-bg": "rgba(248, 248, 248, 0.85)",
    "--hero-btn-bg": "#1a1a1a",
    "--hero-btn-color": "#fff",
    "--pill-bg": "#f0f0f0",
    "--pill-color": "#555",
    "--text-dimmed": "#999",
    "--text-muted": "#777",
    "--text-primary": "#1a1a1a",
    "--text-secondary": "#333",
    "--text-tertiary": "#555",
  },
};

const applyThemeVars = (theme: Theme) => {
  const vars = themeVars[theme];
  const cssText = Object.entries(vars)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
  document.documentElement.style.cssText = cssText;
  document.documentElement.dataset.theme = theme;
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
      applyThemeVars("dark");
      initialized.current = true;
    }
  }, []);

  const toggleTheme = useCallback(
    (e?: React.MouseEvent) => {
      const next = theme === "dark" ? "light" : "dark";

      playLightSwitchSound(next);

      // get click coordinates for circular reveal
      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? 0;

      // use View Transitions API if available
      if (typeof document.startViewTransition === "function") {
        const transition = document.startViewTransition(() => {
          setTheme(next);
          applyThemeVars(next);
        });

        void transition.ready.then(() => {
          animateViewTransition(x, y);
        });
      } else {
        // fallback: just switch instantly
        setTheme(next);
        applyThemeVars(next);
      }
    },
    [theme]
  );

  const contextValue = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};
