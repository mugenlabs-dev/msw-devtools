import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn } from "storybook/test";
import { theme } from "#/plugin/theme";
import { statusConfig } from "./utils";
import { WorkerStatusBar } from "./worker-status-bar";

const meta: Meta<typeof WorkerStatusBar> = {
  title: "Operation List/WorkerStatusBar",
  component: WorkerStatusBar,
  decorators: [
    (Story) => (
      <div style={{ background: theme.colors.background, width: "280px" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    clearSeenOperations: fn(),
    seenOperations: new Set<string>(),
    status: statusConfig.idle,
    workerStatus: "idle",
  },
};

export default meta;
type Story = StoryObj<typeof WorkerStatusBar>;

export const Idle: Story = {
  play: async ({ canvas, step }) => {
    await step("Verify idle state", async () => {
      await expect(canvas.getByText("MSW Idle")).toBeInTheDocument();
      await expect(canvas.queryByRole("button", { name: /clear seen/i })).not.toBeInTheDocument();
    });
  },
};

export const Starting: Story = {
  args: {
    status: statusConfig.starting,
    workerStatus: "starting",
  },
  play: async ({ canvas, step }) => {
    await step("Verify starting state", async () => {
      await expect(canvas.getByText("Starting...")).toBeInTheDocument();
    });
  },
};

export const Active: Story = {
  args: {
    status: statusConfig.active,
    workerStatus: "active",
  },
  play: async ({ canvas, step }) => {
    await step("Verify active state", async () => {
      await expect(canvas.getByText("MSW Active")).toBeInTheDocument();
    });
  },
};

export const WorkerError: Story = {
  name: "Error",
  args: {
    status: statusConfig.error,
    workerStatus: "error",
  },
  play: async ({ canvas, step }) => {
    await step("Verify error state", async () => {
      await expect(canvas.getByText("MSW Error")).toBeInTheDocument();
    });
  },
};

export const ActiveWithSeenOps: Story = {
  name: "Active With Seen Operations",
  args: {
    seenOperations: new Set(["GET /api/users", "POST /api/users"]),
    status: statusConfig.active,
    workerStatus: "active",
  },
  play: async ({ canvas, userEvent, step, args }) => {
    await step("Verify clear button visible", async () => {
      await expect(canvas.getByText("MSW Active")).toBeInTheDocument();
      await expect(canvas.getByRole("button", { name: /clear seen/i })).toBeInTheDocument();
    });
    await step("Click clear seen triggers callback", async () => {
      const button = canvas.getByRole("button", { name: /clear seen/i });
      await userEvent.click(button);
      await expect(args.clearSeenOperations).toHaveBeenCalledTimes(1);
    });
  },
};
