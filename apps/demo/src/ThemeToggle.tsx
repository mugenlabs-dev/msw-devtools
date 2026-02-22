import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeContext";

export function ThemeToggle() {
	const { theme, toggleTheme } = useTheme();

	return (
		<button
			type="button"
			onClick={toggleTheme}
			aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				width: 32,
				height: 32,
				borderRadius: 8,
				border: "1px solid var(--border-primary)",
				background: "var(--bg-tertiary)",
				color: "var(--text-muted)",
				cursor: "pointer",
				transition: "color 0.15s, background 0.15s, border-color 0.15s",
				flexShrink: 0,
				marginLeft: 4,
			}}
		>
			{theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
		</button>
	);
}
