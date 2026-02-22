import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Layout } from "../Layout";
import { ThemeProvider } from "../ThemeContext";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1.0" },
		],
		links: [
			{ rel: "icon", type: "image/svg+xml", href: `${import.meta.env.BASE_URL}favicon.svg` },
		],
		title: "msw-devtool",
	}),
	component: RootComponent,
});

function RootComponent() {
	return (
		<html lang="en">
			<head>
				<HeadContent />
				<style
					// biome-ignore lint/security/noDangerouslySetInnerHtml: inline styles for body
					dangerouslySetInnerHTML={{
						__html: `
							body { margin: 0; background: var(--bg-primary, #0a0a0a); transition: background 0.3s; }
							::view-transition-old(root),
							::view-transition-new(root) {
								animation: none;
								mix-blend-mode: normal;
							}
							::view-transition-old(root) { z-index: 1; }
							::view-transition-new(root) { z-index: 9999; }
						`,
					}}
				/>
			</head>
			<body
				style={{
					minHeight: "100vh",
					fontFamily:
						'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
				}}
			>
				<ThemeProvider>
					<Layout>
						<Outlet />
					</Layout>
				</ThemeProvider>
				<Scripts />
			</body>
		</html>
	);
}
