import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	server: {
		port: 3001,
	},
	base: process.env.VITE_BASE_PATH || "/",
	plugins: [
		tsConfigPaths(),
		tanstackStart({
			pages: [
				{
					path: "/",
					prerender: { enabled: true },
				},
			],
		}),
		react(),
	],
});
