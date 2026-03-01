import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn } from "storybook/test";
import { theme } from "#/plugin/theme";
import { OperationDetailHeader } from "./operation-detail-header";

const meta: Meta<typeof OperationDetailHeader> = {
  title: "Operation Detail/OperationDetailHeader",
  component: OperationDetailHeader,
  decorators: [
    (Story) => (
      <div style={{ background: theme.colors.background, padding: "12px" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    config: { enabled: true },
    onToggle: fn(),
    operationName: "GET /api/users",
    typeBadge: {
      bg: theme.colors.methodGet.bg,
      color: theme.colors.methodGet.color,
      label: "GET /api/users",
    },
  },
};

export default meta;
type Story = StoryObj<typeof OperationDetailHeader>;

export const EnabledRest: Story = {
  name: "Enabled (REST GET)",
  play: async ({ canvas, userEvent, step, args }) => {
    await step("Verify enabled state", async () => {
      const matches = canvas.getAllByText("GET /api/users");
      await expect(matches.length).toBeGreaterThanOrEqual(1);
      const toggle = canvas.getByRole("button", { name: "Toggle mock" });
      await expect(toggle).toHaveAttribute("aria-pressed", "true");
      await expect(toggle).toHaveTextContent("Mocked");
    });
    await step("Click toggle triggers callback", async () => {
      const toggle = canvas.getByRole("button", { name: "Toggle mock" });
      await userEvent.click(toggle);
      await expect(args.onToggle).toHaveBeenCalledTimes(1);
    });
  },
};

export const DisabledPost: Story = {
  name: "Disabled (REST POST)",
  args: {
    config: { enabled: false },
    operationName: "POST /api/users",
    typeBadge: {
      bg: theme.colors.methodPost.bg,
      color: theme.colors.methodPost.color,
      label: "POST /api/users",
    },
  },
  play: async ({ canvas, step }) => {
    await step("Verify disabled state", async () => {
      const matches = canvas.getAllByText("POST /api/users");
      await expect(matches.length).toBeGreaterThanOrEqual(1);
      const toggle = canvas.getByRole("button", { name: "Toggle mock" });
      await expect(toggle).toHaveAttribute("aria-pressed", "false");
      await expect(toggle).toHaveTextContent("Passthrough");
    });
  },
};

export const GraphQLQuery: Story = {
  name: "GraphQL Query",
  args: {
    operationName: "GetUsers",
    typeBadge: {
      bg: theme.colors.gqlQuery.bg,
      color: theme.colors.gqlQuery.color,
      label: "query",
    },
  },
  play: async ({ canvas, step }) => {
    await step("Verify GraphQL query rendering", async () => {
      await expect(canvas.getByText("GetUsers")).toBeInTheDocument();
      await expect(canvas.getByText("query")).toBeInTheDocument();
    });
  },
};
