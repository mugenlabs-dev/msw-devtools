import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn } from "storybook/test";
import { theme } from "#/plugin/theme";
import { ControlsBar } from "./controls-bar";

const meta: Meta<typeof ControlsBar> = {
  title: "Operation List/ControlsBar",
  component: ControlsBar,
  decorators: [
    (Story) => (
      <div style={{ background: theme.colors.background, width: "280px" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    descriptorCount: 7,
    enabledCount: 0,
    onDisableAll: fn(),
    onEnableAll: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ControlsBar>;

export const NoneActive: Story = {
  play: async ({ canvas, userEvent, step, args }) => {
    await step("Verify rendered state", async () => {
      await expect(canvas.getByText("0/7 active")).toBeInTheDocument();
      await expect(canvas.getByText("All On")).toBeInTheDocument();
      await expect(canvas.getByText("All Off")).toBeInTheDocument();
    });
    await step("Click All On triggers onEnableAll", async () => {
      await userEvent.click(canvas.getByText("All On"));
      await expect(args.onEnableAll).toHaveBeenCalledTimes(1);
      await expect(args.onDisableAll).not.toHaveBeenCalled();
    });
  },
};

export const SomeActive: Story = {
  args: {
    enabledCount: 3,
  },
  play: async ({ canvas, step }) => {
    await step("Verify count", async () => {
      await expect(canvas.getByText("3/7 active")).toBeInTheDocument();
    });
  },
};

export const AllActive: Story = {
  args: {
    enabledCount: 7,
  },
  play: async ({ canvas, userEvent, step, args }) => {
    await step("Verify all active count", async () => {
      await expect(canvas.getByText("7/7 active")).toBeInTheDocument();
    });
    await step("Click All Off triggers onDisableAll", async () => {
      await userEvent.click(canvas.getByText("All Off"));
      await expect(args.onDisableAll).toHaveBeenCalledTimes(1);
      await expect(args.onEnableAll).not.toHaveBeenCalled();
    });
  },
};
