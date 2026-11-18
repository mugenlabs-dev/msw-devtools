import { expect, test } from "@playwright/test";

// vercel.json routing only exists on the deployed site, not on the dev server.
const baseUrl = process.env.BASE_URL;
const isDeployed = baseUrl !== undefined && !/\/\/(?:localhost|127\.0\.0\.1)[:/]/u.test(baseUrl);

test.skip(!isDeployed, "needs the deployed site (BASE_URL)");

test.describe("MSW 2 playground routing", () => {
  test("redirects /msw2 to /msw2/ so the MSW 2 worker scope covers the page", async ({
    request,
  }) => {
    const response = await request.get("./msw2", { maxRedirects: 0 });

    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe("/msw2/");
  });

  test("serves library pages under /msw2/ with noindex", async ({ page }) => {
    await page.goto("./msw2/query");

    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    await expect(page.getByTestId("msw-version-switch")).toBeVisible();
  });

  test("lets crawlers fetch /msw2/ so they can read its noindex", async ({ request }) => {
    const robots = await (await request.get("./robots.txt")).text();

    expect(robots).not.toContain("Disallow: /msw2/");
  });
});
