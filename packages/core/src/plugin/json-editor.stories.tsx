import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, waitFor } from "storybook/test";
import { theme } from "#/plugin/theme";
import { JsonEditor } from "./json-editor";

const meta: Meta<typeof JsonEditor> = {
  title: "Editors/JsonEditor",
  component: JsonEditor,
  decorators: [
    (Story) => (
      <div style={{ background: theme.colors.background, height: "300px", padding: "12px" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    hasOverride: false,
    onChange: fn(),
    onReset: fn(),
    value: '{"users": [{"id": 1, "name": "Alice"}]}',
  },
};

export default meta;
type Story = StoryObj<typeof JsonEditor>;

export const Default: Story = {
  name: "Valid JSON",
  play: async ({ canvas, userEvent, step, args }) => {
    await step("Verify valid JSON state", async () => {
      await expect(canvas.getByText("Response JSON")).toBeInTheDocument();
      const textarea = canvas.getByRole("textbox");
      await expect(textarea).toHaveValue('{"users": [{"id": 1, "name": "Alice"}]}');
      await expect(canvas.queryByText("Reset to Default")).not.toBeInTheDocument();
      await expect(canvas.queryByText("Response JSON (custom)")).not.toBeInTheDocument();
      await expect(canvas.queryByText("Invalid JSON")).not.toBeInTheDocument();
    });
    await step("Type invalid JSON shows validation error", async () => {
      const textarea = canvas.getByRole("textbox");
      await userEvent.clear(textarea);
      await userEvent.type(textarea, "not valid json");
      await waitFor(() => {
        expect(canvas.getByText("Invalid JSON")).toBeInTheDocument();
      });
    });
    await step("Type valid JSON clears error and calls onChange", async () => {
      const textarea = canvas.getByRole("textbox");
      await userEvent.clear(textarea);
      await userEvent.type(textarea, '{{"valid": true}');
      await waitFor(() => {
        expect(canvas.queryByText("Invalid JSON")).not.toBeInTheDocument();
      });
      await waitFor(
        () => {
          expect(args.onChange).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });
  },
};

export const WithCustomOverride: Story = {
  name: "Custom Override",
  args: {
    hasOverride: true,
    value: '{"custom": true}',
  },
  play: async ({ canvas, userEvent, step, args }) => {
    await step("Verify custom override state", async () => {
      await expect(canvas.getByText("Response JSON (custom)")).toBeInTheDocument();
      await expect(canvas.getByText("Reset to Default")).toBeInTheDocument();
      const textarea = canvas.getByRole("textbox");
      await expect(textarea).toHaveValue('{"custom": true}');
    });
    await step("Click reset triggers callback", async () => {
      await userEvent.click(canvas.getByText("Reset to Default"));
      await expect(args.onReset).toHaveBeenCalledTimes(1);
    });
  },
};

export const WaitingForRequest: Story = {
  name: "Waiting For First Request",
  args: {
    value: "// Waiting for first request...",
  },
  play: async ({ canvas, step }) => {
    await step("Verify waiting state", async () => {
      const textarea = canvas.getByRole("textbox");
      await expect(textarea).toHaveValue("// Waiting for first request...");
    });
  },
};
