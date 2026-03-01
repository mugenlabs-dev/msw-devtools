import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn } from "storybook/test";
import { customStatusConfig, defaultConfig } from "#/plugin/__stories__/fixtures";
import { theme } from "#/plugin/theme";
import { StatusCodeInput } from "./status-code-input";

const meta: Meta<typeof StatusCodeInput> = {
  title: "Operation Detail/StatusCodeInput",
  component: StatusCodeInput,
  decorators: [
    (Story) => (
      <div
        style={{
          alignItems: "center",
          background: theme.colors.background,
          display: "flex",
          gap: "8px",
          padding: "12px",
        }}
      >
        <Story />
      </div>
    ),
  ],
  args: {
    config: defaultConfig,
    effectiveStatusCode: 200,
    onStatusCodeChange: fn(),
    onStatusCodeReset: fn(),
    operationName: "GET /api/users",
  },
};

export default meta;
type Story = StoryObj<typeof StatusCodeInput>;

export const Default: Story = {
  name: "Default (200)",
  play: async ({ canvas, step }) => {
    await step("Verify default status code", async () => {
      await expect(canvas.getByText("Status")).toBeInTheDocument();
      const input = canvas.getByRole("spinbutton");
      await expect(input).toHaveValue(200);
      await expect(canvas.queryByText("Reset")).not.toBeInTheDocument();
    });
  },
};

export const CustomOverride: Story = {
  name: "Custom (201)",
  args: {
    config: customStatusConfig,
    effectiveStatusCode: 201,
  },
  play: async ({ canvas, userEvent, step, args }) => {
    await step("Verify custom status code", async () => {
      const input = canvas.getByRole("spinbutton");
      await expect(input).toHaveValue(201);
      await expect(canvas.getByText("Reset")).toBeInTheDocument();
    });
    await step("Click reset triggers callback", async () => {
      await userEvent.click(canvas.getByText("Reset"));
      await expect(args.onStatusCodeReset).toHaveBeenCalledTimes(1);
    });
  },
};

export const ChangesStatusCode: Story = {
  name: "Change Status Code",
  play: async ({ canvas, userEvent, step, args }) => {
    await step("Change status code value", async () => {
      const input = canvas.getByRole("spinbutton");
      await userEvent.clear(input);
      await userEvent.type(input, "404");
      await expect(args.onStatusCodeChange).toHaveBeenCalled();
    });
  },
};
