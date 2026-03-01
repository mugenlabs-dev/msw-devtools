import type { Meta, StoryObj } from "@storybook/react";
import { expect, waitFor } from "storybook/test";
import { withMockSeed, withPluginContainer } from "#/plugin/__stories__/decorators";
import { allDescriptors, buildOperations, enabledConfig } from "#/plugin/__stories__/fixtures";
import { MswDevToolsPlugin } from "./msw-dev-tools-plugin";

const meta: Meta<typeof MswDevToolsPlugin> = {
  title: "Plugin/MswDevToolsPlugin",
  component: MswDevToolsPlugin,
  decorators: [withPluginContainer],
};

export default meta;
type Story = StoryObj<typeof MswDevToolsPlugin>;

export const Default: Story = {
  decorators: [withMockSeed()],
  play: async ({ canvas, userEvent, step }) => {
    await step("Verify initial render", async () => {
      await canvas.findByText("MSW Active");
      await canvas.findByText("0/7 active");
      await expect(canvas.getByRole("button", { name: "all" })).toBeInTheDocument();
      await expect(canvas.getByText("GET /api/users")).toBeInTheDocument();
      await expect(canvas.getByText("POST /api/users")).toBeInTheDocument();
      await expect(canvas.getByText("DELETE /api/users/:id")).toBeInTheDocument();
      await expect(canvas.getByText("GET /api/products")).toBeInTheDocument();
      await expect(canvas.getByText("GET /api/orders")).toBeInTheDocument();
      await expect(canvas.getByText("GetUsers")).toBeInTheDocument();
      await expect(canvas.getByText("CreateUser")).toBeInTheDocument();
      await expect(canvas.getByText("Select an operation to configure")).toBeInTheDocument();
    });
    await step("Select operation shows detail pane", async () => {
      const rows = canvas.getAllByTestId("operation-row");
      await expect(rows.length).toBeGreaterThan(0);
      await userEvent.click(rows[0]);
      const detailToggle = await canvas.findByRole("button", { name: "Toggle mock" });
      await expect(detailToggle).toBeInTheDocument();
      await expect(canvas.queryByText("Select an operation to configure")).not.toBeInTheDocument();
    });
    await step("Select and toggle mock", async () => {
      const row = canvas
        .getAllByTestId("operation-row")
        .find((r) => r.getAttribute("aria-label") === "GET /api/users") as HTMLElement;
      await userEvent.click(row);
      const toggle = await canvas.findByRole("button", { name: "Toggle mock" });
      await expect(toggle).toHaveTextContent("Passthrough");
      await userEvent.click(toggle);
      await expect(toggle).toHaveTextContent("Mocked");
      await expect(canvas.getByText("1/7 active")).toBeInTheDocument();
    });
    await step("Select and set error override", async () => {
      const row = canvas
        .getAllByTestId("operation-row")
        .find((r) => r.getAttribute("aria-label") === "GET /api/users") as HTMLElement;
      await userEvent.click(row);
      await canvas.findByRole("button", { name: "Toggle mock" });
      await userEvent.click(canvas.getByRole("button", { name: "Set error override to 500" }));
      await waitFor(() => {
        expect(canvas.getByText("Error override active: 500")).toBeInTheDocument();
      });
    });
    await step("Enable all mocks", async () => {
      await userEvent.click(canvas.getByText("All On"));
      await waitFor(() => {
        expect(canvas.getByText("7/7 active")).toBeInTheDocument();
      });
    });
    await step("Filter REST operations", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "rest" }));
      await waitFor(() => {
        expect(canvas.queryByText("GetUsers")).not.toBeInTheDocument();
      });
      await expect(canvas.queryByText("CreateUser")).not.toBeInTheDocument();
      await expect(canvas.getAllByText("GET /api/users").length).toBeGreaterThan(0);
    });
    await step("Filter GraphQL operations", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "graphql" }));
      await waitFor(() => {
        // Only GraphQL operation rows should remain in the list
        expect(canvas.getAllByTestId("operation-row")).toHaveLength(2);
      });
      await expect(canvas.getAllByText("GetUsers").length).toBeGreaterThan(0);
      await expect(canvas.getAllByText("CreateUser").length).toBeGreaterThan(0);
    });
    await step("Toggle grouping off", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "all" }));
      await waitFor(() => {
        expect(canvas.getAllByTestId("operation-row")).toHaveLength(7);
      });
      const groupToggle = canvas.getByTestId("group-toggle");
      await expect(groupToggle).toHaveAttribute("aria-pressed", "true");
      await userEvent.click(groupToggle);
      await expect(groupToggle).toHaveAttribute("aria-pressed", "false");
    });
  },
};

export const AllMocksEnabled: Story = {
  name: "All Mocks Enabled",
  decorators: [
    withMockSeed({
      operations: buildOperations(allDescriptors, enabledConfig),
    }),
  ],
  play: async ({ canvas, step }) => {
    await step("Verify all mocks enabled", async () => {
      await canvas.findByText("7/7 active");
    });
  },
};

export const EmptyState: Story = {
  name: "Empty (No Operations)",
  decorators: [withMockSeed({ descriptors: [] })],
  play: async ({ canvas, step }) => {
    await step("Verify empty state", async () => {
      await canvas.findByText("MSW Active");
      await canvas.findByText("0/0 active");
      await expect(canvas.queryAllByTestId("operation-row")).toHaveLength(0);
    });
  },
};
