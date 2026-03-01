import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn } from "storybook/test";
import { theme } from "#/plugin/theme";
import { ErrorOverrideSelector } from "./error-override-selector";

const meta: Meta<typeof ErrorOverrideSelector> = {
  title: "Operation Detail/ErrorOverrideSelector",
  component: ErrorOverrideSelector,
  decorators: [
    (Story) => (
      <div style={{ background: theme.colors.background, padding: "12px", width: "400px" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    onChange: fn(),
    operationName: "GET /api/users",
    value: null,
  },
};

export default meta;
type Story = StoryObj<typeof ErrorOverrideSelector>;

export const NoOverride: Story = {
  play: async ({ canvas, userEvent, step, args }) => {
    await step("Verify no override state", async () => {
      await expect(canvas.getByText("Error Override")).toBeInTheDocument();
      const btn401 = canvas.getByRole("button", { name: "Set error override to 401" });
      const btn404 = canvas.getByRole("button", { name: "Set error override to 404" });
      const btn429 = canvas.getByRole("button", { name: "Set error override to 429" });
      const btn500 = canvas.getByRole("button", { name: "Set error override to 500" });
      const btnNetwork = canvas.getByRole("button", {
        name: "Set error override to Network Error",
      });
      await expect(btn401).toHaveAttribute("aria-pressed", "false");
      await expect(btn404).toHaveAttribute("aria-pressed", "false");
      await expect(btn429).toHaveAttribute("aria-pressed", "false");
      await expect(btn500).toHaveAttribute("aria-pressed", "false");
      await expect(btnNetwork).toHaveAttribute("aria-pressed", "false");
    });
    await step("Activate 404 override", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Set error override to 404" }));
      await expect(args.onChange).toHaveBeenCalledWith(404);
    });
    await step("Activate Network Error override", async () => {
      await userEvent.click(
        canvas.getByRole("button", { name: "Set error override to Network Error" })
      );
      await expect(args.onChange).toHaveBeenCalledWith("networkError");
    });
  },
};

export const Unauthorized401: Story = {
  name: "401 Unauthorized",
  args: { value: 401 },
  play: async ({ canvas, step }) => {
    await step("Verify 401 active", async () => {
      const btn401 = canvas.getByRole("button", { name: "Set error override to 401" });
      await expect(btn401).toHaveAttribute("aria-pressed", "true");
      await expect(
        canvas.getByRole("button", { name: "Set error override to 404" })
      ).toHaveAttribute("aria-pressed", "false");
    });
  },
};

export const NotFound404: Story = {
  name: "404 Not Found",
  args: { value: 404 },
  play: async ({ canvas, step }) => {
    await step("Verify 404 active", async () => {
      await expect(
        canvas.getByRole("button", { name: "Set error override to 404" })
      ).toHaveAttribute("aria-pressed", "true");
    });
  },
};

export const ServerError500: Story = {
  name: "500 Server Error",
  args: { value: 500 },
  play: async ({ canvas, userEvent, step, args }) => {
    await step("Verify 500 active", async () => {
      await expect(
        canvas.getByRole("button", { name: "Set error override to 500" })
      ).toHaveAttribute("aria-pressed", "true");
    });
    await step("Deactivate by clicking active button", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Set error override to 500" }));
      await expect(args.onChange).toHaveBeenCalledWith(null);
    });
    await step("Switch to 401", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Set error override to 401" }));
      await expect(args.onChange).toHaveBeenCalledWith(401);
    });
  },
};

export const NetworkError: Story = {
  args: { value: "networkError" },
  play: async ({ canvas, step }) => {
    await step("Verify network error active", async () => {
      await expect(
        canvas.getByRole("button", { name: "Set error override to Network Error" })
      ).toHaveAttribute("aria-pressed", "true");
    });
  },
};
