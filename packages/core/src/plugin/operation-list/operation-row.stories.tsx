import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn } from "storybook/test";
import {
  graphqlMutationDescriptor,
  graphqlQueryDescriptor,
  restDeleteDescriptor,
  restGetDescriptor,
  restPostDescriptor,
} from "#/plugin/__stories__/fixtures";
import { theme } from "#/plugin/theme";
import { OperationRow } from "./operation-row";

const meta: Meta<typeof OperationRow> = {
  title: "Operation List/OperationRow",
  component: OperationRow,
  decorators: [
    (Story) => (
      <div style={{ background: theme.colors.background, width: "280px" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    descriptor: restGetDescriptor,
    isEnabled: false,
    isErrorVariant: false,
    isSeen: false,
    isSelected: false,
    onSelect: fn(),
    onToggle: fn(),
    variantLabel: undefined,
  },
};

export default meta;
type Story = StoryObj<typeof OperationRow>;

export const Disabled: Story = {
  play: async ({ canvas, userEvent, step, args }) => {
    await step("Verify rendered state", async () => {
      await expect(canvas.getByText("GET /api/users")).toBeInTheDocument();
      await expect(canvas.getByText("rest")).toBeInTheDocument();
      await expect(canvas.getByText("GET")).toBeInTheDocument();
      const toggle = canvas.getByRole("button", {
        name: "Toggle GET /api/users mock",
      });
      await expect(toggle).toHaveAttribute("aria-pressed", "false");
    });
    await step("Click row triggers onSelect", async () => {
      await userEvent.click(canvas.getByRole("button", { name: restGetDescriptor.operationName }));
      await expect(args.onSelect).toHaveBeenCalledTimes(1);
    });
    await step("Click toggle triggers onToggle", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Toggle GET /api/users mock" }));
      await expect(args.onToggle).toHaveBeenCalledTimes(1);
    });
  },
};

export const Enabled: Story = {
  args: {
    isEnabled: true,
    variantLabel: "Default",
  },
  play: async ({ canvas, userEvent, step, args }) => {
    await step("Verify enabled state", async () => {
      await expect(canvas.getByText("GET /api/users")).toBeInTheDocument();
      const toggle = canvas.getByRole("button", {
        name: "Toggle GET /api/users mock",
      });
      await expect(toggle).toHaveAttribute("aria-pressed", "true");
      await expect(canvas.getByText(/· Default/)).toBeInTheDocument();
    });
    await step("Keyboard Enter triggers onSelect", async () => {
      const row = canvas.getByRole("button", { name: restGetDescriptor.operationName });
      row.focus();
      await userEvent.keyboard("{Enter}");
      await expect(args.onSelect).toHaveBeenCalledTimes(1);
    });
    await step("Keyboard Space triggers onSelect", async () => {
      const row = canvas.getByRole("button", { name: restGetDescriptor.operationName });
      row.focus();
      await userEvent.keyboard(" ");
      await expect(args.onSelect).toHaveBeenCalledTimes(2);
    });
  },
};

export const Selected: Story = {
  args: {
    isSelected: true,
  },
  play: async ({ canvas, step }) => {
    await step("Verify selected state", async () => {
      const row = canvas.getByRole("button", { name: "GET /api/users" });
      await expect(row).toBeInTheDocument();
      const style = getComputedStyle(row);
      await expect(style.borderLeft).toContain("2px");
    });
  },
};

export const WithLiveBadge: Story = {
  args: {
    isEnabled: true,
    isSeen: true,
    variantLabel: "Default",
  },
  play: async ({ canvas, step }) => {
    await step("Verify live badge", async () => {
      await expect(canvas.getByText("LIVE")).toBeInTheDocument();
      await expect(canvas.getByText(/· Default/)).toBeInTheDocument();
    });
  },
};

export const WithErrorOverride: Story = {
  args: {
    isEnabled: true,
    isErrorVariant: true,
  },
  play: async ({ canvas, step }) => {
    await step("Verify error override state", async () => {
      const toggle = canvas.getByRole("button", {
        name: "Toggle GET /api/users mock",
      });
      await expect(toggle).toHaveAttribute("aria-pressed", "true");
    });
  },
};

export const GraphQLQuery: Story = {
  args: {
    descriptor: graphqlQueryDescriptor,
  },
  play: async ({ canvas, step }) => {
    await step("Verify GraphQL query rendering", async () => {
      await expect(canvas.getByText("GetUsers")).toBeInTheDocument();
      await expect(canvas.getByText("graphql")).toBeInTheDocument();
      await expect(canvas.getByText("query")).toBeInTheDocument();
    });
  },
};

export const GraphQLMutation: Story = {
  args: {
    descriptor: graphqlMutationDescriptor,
  },
  play: async ({ canvas, step }) => {
    await step("Verify GraphQL mutation rendering", async () => {
      await expect(canvas.getByText("CreateUser")).toBeInTheDocument();
      await expect(canvas.getByText("graphql")).toBeInTheDocument();
      await expect(canvas.getByText("mutation")).toBeInTheDocument();
    });
  },
};

export const RestPost: Story = {
  args: {
    descriptor: restPostDescriptor,
    isEnabled: true,
    variantLabel: "Default",
  },
  play: async ({ canvas, step }) => {
    await step("Verify REST POST rendering", async () => {
      await expect(canvas.getByRole("button", { name: "POST /api/users" })).toBeInTheDocument();
      await expect(canvas.getByText("rest")).toBeInTheDocument();
      await expect(canvas.getByText(/· Default/)).toBeInTheDocument();
      const toggle = canvas.getByRole("button", { name: "Toggle POST /api/users mock" });
      await expect(toggle).toHaveAttribute("aria-pressed", "true");
    });
  },
};

export const RestDelete: Story = {
  args: {
    descriptor: restDeleteDescriptor,
  },
  play: async ({ canvas, step }) => {
    await step("Verify REST DELETE rendering", async () => {
      await expect(canvas.getByText("DELETE /api/users/:id")).toBeInTheDocument();
      await expect(canvas.getByText("rest")).toBeInTheDocument();
      await expect(canvas.getByText("DELETE")).toBeInTheDocument();
    });
  },
};
