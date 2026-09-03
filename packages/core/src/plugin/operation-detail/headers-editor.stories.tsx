import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, waitFor } from "storybook/test";
import { theme } from "#/plugin/theme";
import { HeadersEditor } from "./headers-editor";

const meta: Meta<typeof HeadersEditor> = {
  args: {
    effectiveHeaders: "{}",
    hasHeadersOverride: false,
    onHeadersChange: fn(),
    onHeadersReset: fn(),
    operationName: "GET /api/users",
  },
  component: HeadersEditor,
  decorators: [
    (Story) => (
      <div style={{ background: theme.colors.background, padding: "12px", width: "400px" }}>
        <Story />
      </div>
    ),
  ],
  title: "Operation Detail/HeadersEditor",
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
  args: {
    effectiveHeaders: '{"X-Custom": "value"}',
    hasHeadersOverride: true,
  },
  name: "Custom Headers",
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
    });
    await step("Commits valid JSON after the debounce", async () => {
      await waitFor(
        () => {
          expect(args.onHeadersChange).toHaveBeenCalledWith('{"Content-Type": "application/json"}');
        },
        { timeout: 2000 }
      );
    });
  },
};

export const InvalidHeaders: Story = {
  name: "Invalid Headers",
  play: async ({ canvas, userEvent, step, args }) => {
    await step("Type invalid JSON", async () => {
      const textarea = canvas.getByRole("textbox");
      await userEvent.clear(textarea);
      await userEvent.type(textarea, "{{not json");
      await expect(canvas.getByText("Invalid JSON")).toBeInTheDocument();
    });
    await step("Invalid text is never committed", async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await expect(args.onHeadersChange).not.toHaveBeenCalled();
    });
    await step("Fixing the JSON clears the error and commits", async () => {
      const textarea = canvas.getByRole("textbox");
      await userEvent.clear(textarea);
      await userEvent.type(textarea, '{{"X-Id": "1"}');
      await expect(canvas.queryByText("Invalid JSON")).not.toBeInTheDocument();
      await waitFor(
        () => {
          expect(args.onHeadersChange).toHaveBeenCalledWith('{"X-Id": "1"}');
        },
        { timeout: 2000 }
      );
    });
  },
};
