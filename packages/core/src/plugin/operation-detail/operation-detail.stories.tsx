import type { Meta, StoryObj } from "@storybook/react";
import { expect, waitFor } from "storybook/test";
import { withMockSeed } from "#/plugin/__stories__/decorators";
import {
  allDescriptors,
  buildOperations,
  customJsonConfig,
  enabledConfig,
  errorOverrideConfig,
} from "#/plugin/__stories__/fixtures";
import { theme } from "#/plugin/theme";
import { OperationDetail } from "./operation-detail";

const meta: Meta<typeof OperationDetail> = {
  title: "Operation Detail/OperationDetail",
  component: OperationDetail,
  decorators: [
    (Story) => (
      <div
        style={{
          background: theme.colors.background,
          display: "flex",
          height: "500px",
          width: "500px",
        }}
      >
        <Story />
      </div>
    ),
  ],
  args: {
    operationName: null,
  },
};

export default meta;
type Story = StoryObj<typeof OperationDetail>;

export const NoSelection: Story = {
  name: "No Selection (Placeholder)",
  play: async ({ canvas, step }) => {
    await step("Verify placeholder", async () => {
      await expect(canvas.getByText("Select an operation to configure")).toBeInTheDocument();
    });
  },
};

export const RestEndpoint: Story = {
  name: "REST Endpoint Selected",
  args: { operationName: "GET /api/users" },
  decorators: [
    withMockSeed({
      operations: buildOperations(allDescriptors, enabledConfig),
    }),
  ],
  play: async ({ canvas, userEvent, step }) => {
    await step("Verify REST endpoint detail", async () => {
      const toggle = await canvas.findByRole("button", { name: "Toggle mock" });
      await expect(toggle).toHaveAttribute("aria-pressed", "true");
      await expect(toggle).toHaveTextContent("Mocked");
      await expect(canvas.getByText("Variant")).toBeInTheDocument();
      await expect(canvas.getByText("Error Override")).toBeInTheDocument();
      await expect(canvas.getByText("Delay")).toBeInTheDocument();
      await expect(canvas.getByText("Status")).toBeInTheDocument();
      await expect(canvas.getByText("Headers")).toBeInTheDocument();
      await expect(canvas.getByText("Response JSON")).toBeInTheDocument();
    });
    await step("Toggle operation off", async () => {
      const toggle = canvas.getByRole("button", { name: "Toggle mock" });
      await expect(toggle).toHaveTextContent("Mocked");
      await userEvent.click(toggle);
      await expect(toggle).toHaveTextContent("Passthrough");
    });
    await step("Select error override", async () => {
      const errorBtn = canvas.getByRole("button", { name: "Set error override to 404" });
      await userEvent.click(errorBtn);
      await waitFor(() => {
        expect(canvas.getByText("Error override active: 404")).toBeInTheDocument();
      });
      await expect(canvas.queryByText("Headers")).not.toBeInTheDocument();
      await expect(canvas.queryByText("Response JSON")).not.toBeInTheDocument();
    });
    await step("Change variant", async () => {
      const select = await canvas.findByRole("combobox", { name: "Variant" });
      await expect(select).toHaveValue("variant-0");
      await userEvent.selectOptions(select, "variant-1");
      await expect(select).toHaveValue("variant-1");
    });
  },
};

export const WithErrorOverride: Story = {
  name: "Error Override Active",
  args: { operationName: "GET /api/users" },
  decorators: [
    withMockSeed({
      operations: {
        ...buildOperations(allDescriptors, enabledConfig),
        "GET /api/users": { ...errorOverrideConfig },
      },
    }),
  ],
  play: async ({ canvas, step }) => {
    await step("Verify error override state", async () => {
      await canvas.findByRole("button", { name: "Toggle mock" });
      await expect(canvas.getByText("Error override active: 500")).toBeInTheDocument();
      await expect(canvas.queryByText("Headers")).not.toBeInTheDocument();
      await expect(canvas.queryByText("Response JSON")).not.toBeInTheDocument();
      await expect(canvas.queryByText("Status")).not.toBeInTheDocument();
    });
  },
};

export const WithCustomJson: Story = {
  name: "Custom JSON Override",
  args: { operationName: "GET /api/users" },
  decorators: [
    withMockSeed({
      operations: {
        ...buildOperations(allDescriptors, enabledConfig),
        "GET /api/users": { ...customJsonConfig },
      },
    }),
  ],
  play: async ({ canvas, step }) => {
    await step("Verify custom JSON", async () => {
      await canvas.findByText("Response JSON (custom)");
      const textareas = canvas.getAllByRole("textbox");
      const jsonTextarea = textareas.find((t) =>
        (t as HTMLTextAreaElement).value?.includes('"custom"')
      );
      await expect(jsonTextarea).toBeTruthy();
    });
  },
};

export const GraphQLEndpoint: Story = {
  name: "GraphQL Query Selected",
  args: { operationName: "GetUsers" },
  decorators: [
    withMockSeed({
      operations: buildOperations(allDescriptors, enabledConfig),
    }),
  ],
  play: async ({ canvas, step }) => {
    await step("Verify GraphQL query detail", async () => {
      await canvas.findByRole("button", { name: "Toggle mock" });
      await expect(canvas.getByText("GetUsers")).toBeInTheDocument();
      await expect(canvas.getByText("query")).toBeInTheDocument();
    });
  },
};
