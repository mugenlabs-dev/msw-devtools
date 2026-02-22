import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
	type ReactNode,
} from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
	theme: Theme;
	toggleTheme: (e?: React.MouseEvent) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
	theme: "dark",
	toggleTheme: () => {},
});

export function useTheme() {
	return useContext(ThemeContext);
}

// ---- light-switch click sound via Web Audio API ----
// Inspired by joshwcomeau.com — different tones for each direction
function playLightSwitchSound(targetTheme: Theme) {
	try {
		const ctx = new AudioContext();
		const now = ctx.currentTime;

		if (targetTheme === "light") {
			// Rising, bright pop for activating light mode
			const osc = ctx.createOscillator();
			osc.type = "sine";
			osc.frequency.setValueAtTime(400, now);
			osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
			osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

			const gain = ctx.createGain();
			gain.gain.setValueAtTime(0.25, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.start(now);
			osc.stop(now + 0.15);

			// Harmonic sparkle
			const osc2 = ctx.createOscillator();
			osc2.type = "sine";
			osc2.frequency.setValueAtTime(1200, now + 0.02);
			osc2.frequency.exponentialRampToValueAtTime(800, now + 0.1);

			const gain2 = ctx.createGain();
			gain2.gain.setValueAtTime(0.08, now + 0.02);
			gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

			osc2.connect(gain2);
			gain2.connect(ctx.destination);
			osc2.start(now + 0.02);
			osc2.stop(now + 0.1);
		} else {
			// Falling, mellow pop for activating dark mode
			const osc = ctx.createOscillator();
			osc.type = "sine";
			osc.frequency.setValueAtTime(500, now);
			osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);

			const gain = ctx.createGain();
			gain.gain.setValueAtTime(0.25, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.start(now);
			osc.stop(now + 0.15);

			// Soft low harmonic
			const osc2 = ctx.createOscillator();
			osc2.type = "sine";
			osc2.frequency.setValueAtTime(300, now);
			osc2.frequency.exponentialRampToValueAtTime(150, now + 0.12);

			const gain2 = ctx.createGain();
			gain2.gain.setValueAtTime(0.1, now);
			gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

			osc2.connect(gain2);
			gain2.connect(ctx.destination);
			osc2.start(now);
			osc2.stop(now + 0.12);
		}

		setTimeout(() => ctx.close(), 300);
	} catch {
		// AudioContext not available, silently skip
	}
}

// ---- CSS variables for each theme ----
const themeVars: Record<Theme, Record<string, string>> = {
	dark: {
		"--bg-primary": "#0a0a0a",
		"--bg-secondary": "#111",
		"--bg-tertiary": "#1a1a1a",
		"--text-primary": "#fff",
		"--text-secondary": "#e0e0e0",
		"--text-tertiary": "#aaa",
		"--text-muted": "#888",
		"--text-dimmed": "#666",
		"--border-primary": "#222",
		"--border-secondary": "#333",
		"--border-tertiary": "#444",
		"--accent-green": "#4ade80",
		"--accent-blue": "#6cb6ff",
		"--accent-purple": "#a78bfa",
		"--header-bg": "rgba(10, 10, 10, 0.85)",
		"--card-bg": "#111",
		"--hero-btn-bg": "#fff",
		"--hero-btn-color": "#000",
		"--code-bg": "rgba(255,255,255,0.06)",
		"--pill-bg": "#111",
		"--pill-color": "#aaa",
		"--code-block-bg": "#0d1117",
		"--badge-rest-bg": "#1e3a5f",
		"--badge-rest-color": "#60a5fa",
		"--badge-graphql-bg": "#3a1e5f",
		"--badge-graphql-color": "#a78bfa",
		"--badge-method-bg": "#1e3a5f",
		"--badge-method-color": "#60a5fa",
		"--badge-lib-bg": "#1a2a1a",
		"--badge-lib-color": "#4ade80",
	},
	light: {
		"--bg-primary": "#f8f8f8",
		"--bg-secondary": "#fff",
		"--bg-tertiary": "#eee",
		"--text-primary": "#1a1a1a",
		"--text-secondary": "#333",
		"--text-tertiary": "#555",
		"--text-muted": "#777",
		"--text-dimmed": "#999",
		"--border-primary": "#ddd",
		"--border-secondary": "#ccc",
		"--border-tertiary": "#bbb",
		"--accent-green": "#16a34a",
		"--accent-blue": "#2563eb",
		"--accent-purple": "#7c3aed",
		"--header-bg": "rgba(248, 248, 248, 0.85)",
		"--card-bg": "#fff",
		"--hero-btn-bg": "#1a1a1a",
		"--hero-btn-color": "#fff",
		"--code-bg": "rgba(0,0,0,0.05)",
		"--pill-bg": "#f0f0f0",
		"--pill-color": "#555",
		"--code-block-bg": "#1e293b",
		"--badge-rest-bg": "#dbeafe",
		"--badge-rest-color": "#1d4ed8",
		"--badge-graphql-bg": "#ede9fe",
		"--badge-graphql-color": "#6d28d9",
		"--badge-method-bg": "#dbeafe",
		"--badge-method-color": "#1d4ed8",
		"--badge-lib-bg": "#dcfce7",
		"--badge-lib-color": "#15803d",
	},
};

function applyThemeVars(theme: Theme) {
	const vars = themeVars[theme];
	for (const [key, value] of Object.entries(vars)) {
		document.documentElement.style.setProperty(key, value);
	}
	document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
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
			if (document.startViewTransition) {
				const transition = document.startViewTransition(() => {
					setTheme(next);
					applyThemeVars(next);
				});

				transition.ready.then(() => {
					const maxRadius = Math.hypot(
						Math.max(x, window.innerWidth - x),
						Math.max(y, window.innerHeight - y),
					);

					document.documentElement.animate(
						{
							clipPath: [
								`circle(0px at ${x}px ${y}px)`,
								`circle(${maxRadius}px at ${x}px ${y}px)`,
							],
						},
						{
							duration: 500,
							easing: "ease-in-out",
							pseudoElement: "::view-transition-new(root)",
						},
					);
				});
			} else {
				// fallback: just switch instantly
				setTheme(next);
				applyThemeVars(next);
			}
		},
		[theme],
	);

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}
