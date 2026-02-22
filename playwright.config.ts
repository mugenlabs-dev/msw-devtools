import { defineConfig } from "@playwright/test";

const baseURL = process.env.BASE_URL || "http://localhost:3001";
const isRemote = !!process.env.BASE_URL;

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: 1,
	reporter: "html",
	use: {
		baseURL,
		trace: "on-first-retry",
	},
	...(isRemote
		? {}
		: {
				webServer: {
					command: "pnpm build && pnpm dev:demo",
					url: "http://localhost:3001",
					reuseExistingServer: !process.env.CI,
					timeout: 120000,
				},
			}),
});
