import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, Gamepad2, Github, ExternalLink } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { GradualBlur } from "./GradualBlur";

export function Layout({ children }: { children: ReactNode }) {
	return (
		<>
			<header
				style={{
					position: "sticky",
					top: 0,
					zIndex: 50,
					background: "var(--header-bg)",
					borderBottom: "1px solid var(--border-primary)",
					backdropFilter: "blur(12px)",
					WebkitBackdropFilter: "blur(12px)",
					transition: "background 0.3s, border-color 0.3s",
				}}
			>
				<div
					style={{
						maxWidth: 720,
						margin: "0 auto",
						padding: "0 24px",
						height: 56,
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<Link
						to="/"
						style={{
							textDecoration: "none",
							display: "flex",
							alignItems: "center",
							gap: 10,
						}}
					>
						<img
							src={`${import.meta.env.BASE_URL}logo.svg`}
							alt="msw-devtool logo"
							style={{
								width: 28,
								height: 28,
								borderRadius: 6,
							}}
						/>
						<span
							style={{
								fontSize: 18,
								fontWeight: 700,
								color: "var(--text-primary)",
								fontFamily:
									"ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
								letterSpacing: "-0.02em",
								transition: "color 0.3s",
							}}
						>
							msw-devtool
						</span>
					</Link>

					<nav
						style={{
							display: "flex",
							alignItems: "center",
							gap: 4,
						}}
					>
						<Link
							to="/"
							activeOptions={{ exact: true }}
							style={{ textDecoration: "none" }}
						>
							{({ isActive }) => (
								<span
									style={{
										fontSize: 14,
										fontWeight: 500,
										color: isActive
											? "var(--text-primary)"
											: "var(--text-muted)",
										padding: "6px 12px",
										borderRadius: 6,
										background: isActive
											? "var(--bg-tertiary)"
											: "transparent",
										transition:
											"color 0.15s, background 0.15s",
										display: "flex",
										alignItems: "center",
										gap: 6,
									}}
								>
									<BookOpen size={14} />
									Docs
								</span>
							)}
						</Link>

						<Link
							to="/playground"
							style={{ textDecoration: "none" }}
						>
							{({ isActive }) => (
								<span
									style={{
										fontSize: 14,
										fontWeight: 500,
										color: isActive
											? "var(--text-primary)"
											: "var(--text-muted)",
										padding: "6px 12px",
										borderRadius: 6,
										background: isActive
											? "var(--bg-tertiary)"
											: "transparent",
										transition:
											"color 0.15s, background 0.15s",
										display: "flex",
										alignItems: "center",
										gap: 6,
									}}
								>
									<Gamepad2 size={14} />
									Playground
								</span>
							)}
						</Link>

						<a
							href="#"
							target="_blank"
							rel="noopener noreferrer"
							style={{
								fontSize: 14,
								fontWeight: 500,
								color: "var(--text-muted)",
								padding: "6px 12px",
								borderRadius: 6,
								textDecoration: "none",
								display: "flex",
								alignItems: "center",
								gap: 6,
								transition: "color 0.15s",
							}}
						>
							<Github size={14} />
							GitHub
							<ExternalLink
								size={10}
								style={{ opacity: 0.5 }}
							/>
						</a>

						<ThemeToggle />
					</nav>
				</div>
			</header>

			{children}

			<GradualBlur direction="bottom" height="120px" maxBlur={10} layers={5} />
		</>
	);
}
