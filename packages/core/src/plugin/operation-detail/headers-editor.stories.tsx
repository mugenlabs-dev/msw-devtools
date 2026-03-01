import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn } from "storybook/test";
import { theme } from "#/plugin/theme";
import { HeadersEditor } from "./headers-editor";

const meta: Meta<typeof HeadersEditor> = {
  title: "Operation Detail/HeadersEditor",
  component: HeadersEditor,
  decorators: [
    (Story) => (
      <div style={{ background: theme.colors.background, padding: "12px", width: "400px" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    effectiveHeaders: "{}",
    hasHeadersOverride: false,
    onHeadersChange: fn(),
    onHeadersReset: fn(),
    operationName: "GET /api/users",
  },
};

export default meta;
type Story = StoryObj<typeof HeadersEditor>;

export const Default: Story = {
  name: "No Override",
  play: async ({ canvas, step }) => {
    await step("Verify default state", async () => {
      await expect(canvas.getByText("Headers")).toBeInTheDocument();
      const textarea = canvas.getByRole("textbox");
      await expect(textarea).toHaveValue("{}");
      await expect(canvas.queryByText("Reset")).not.toBeInTheDocument();
    });
  },
};

export const WithCustomHeaders: Story = {
  name: "Custom Headers",
  args: {
    effectiveHeaders: '{"X-Custom": "value"}',
    hasHeadersOverride: true,
  },
  play: async ({ canvas, userEvent, step, args }) => {
    await step("Verify custom headers state", async () => {
      const textarea = canvas.getByRole("textbox");
      await expect(textarea).toHaveValue('{"X-Custom": "value"}');
      await expect(canvas.getByText("Reset")).toBeInTheDocument();
    });
    await step("Click reset triggers callback", async () => {
      await userEvent.click(canvas.getByText("Reset"));
      await expect(args.onHeadersReset).toHaveBeenCalledTimes(1);
    });
  },
};

export const EditsHeaders: Story = {
  name: "Edit Headers",
  play: async ({ canvas, userEvent, step, args }) => {
    await step("Edit header text", async () => {
      const textarea = canvas.getByRole("textbox");
      await userEvent.clear(textarea);
      await userEvent.type(textarea, '{{"Content-Type": "application/json"}');
      await expect(args.onHeadersChange).toHaveBeenCalled();
    });
  },
};
