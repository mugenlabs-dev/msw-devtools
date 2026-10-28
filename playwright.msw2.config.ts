import { defineConfig } from "@playwright/test";

export default defineConfig({
  forbidOnly: process.env.CI !== undefined,
  fullyParallel: true,
  reporter: "list",
  retries: process.env.CI === undefined ? 0 : 1,
  testDir: "./e2e-msw2",
  use: {
    // App is served with Vite base `/msw2/` (same path as production).
    baseURL: "http://localhost:3002/msw2/",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm --filter msw2-e2e exec vite --host 127.0.0.1 --port 3002",
    reuseExistingServer: process.env.CI === undefined,
    timeout: 120_000,
    url: "http://localhost:3002/msw2/",
  },
  workers: process.env.CI === undefined ? undefined : 2,
});
