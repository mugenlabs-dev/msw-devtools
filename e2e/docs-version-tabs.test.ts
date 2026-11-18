import { expect, test } from "@playwright/test";

test.describe("Quick Start MSW version tabs", () => {
  test("follow the WAI-ARIA tabs pattern", async ({ page }) => {
    await page.goto("./");
    const tablist = page.getByRole("tablist", { name: "MSW major" });
    const msw3 = tablist.getByRole("tab", { name: "MSW 3" });
    const msw2 = tablist.getByRole("tab", { name: "MSW 2" });
    const panel = page.getByRole("tabpanel", { name: "MSW 3" });

    await expect(msw3).toHaveAttribute("aria-selected", "true");
    await expect(panel).toContainText('from "msw/graphql"');
    // Only the selected tab is in the Tab order.
    await expect(msw3).toHaveAttribute("tabindex", "0");
    await expect(msw2).toHaveAttribute("tabindex", "-1");

    // The docs page is prerendered; keys do nothing until React hydrates.
    await expect(async () => {
      await msw3.focus();
      await page.keyboard.press("ArrowRight");
      await expect(msw2).toHaveAttribute("aria-selected", "true", { timeout: 500 });
    }).toPass();

    await expect(msw2).toBeFocused();
    await expect(msw2).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel", { name: "MSW 2" })).not.toContainText("msw/graphql");

    await page.keyboard.press("ArrowRight");
    await expect(msw3).toBeFocused();
    await page.keyboard.press("End");
    await expect(msw2).toBeFocused();
    await page.keyboard.press("Home");
    await expect(msw3).toHaveAttribute("aria-selected", "true");
  });
});
