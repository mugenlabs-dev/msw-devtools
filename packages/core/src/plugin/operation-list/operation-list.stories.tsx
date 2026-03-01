import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, waitFor } from "storybook/test";
import { withMockSeed } from "#/plugin/__stories__/decorators";
import { allDescriptors, buildOperations, enabledConfig } from "#/plugin/__stories__/fixtures";
import { theme } from "#/plugin/theme";
import { OperationList } from "./operation-list";

const meta: Meta<typeof OperationList> = {
  title: "Operation List/OperationList",
  component: OperationList,
  decorators: [
    (Story) => (
      <div style={{ background: theme.colors.background, height: "500px" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    onSelectOperation: fn(),
    selectedOperation: null,
  },
};

export default meta;
type Story = StoryObj<typeof OperationList>;

export const Default: Story = {
  decorators: [withMockSeed()],
  play: async ({ canvas, userEvent, step, args }) => {
    await step("Verify initial render", async () => {
      await canvas.findByText("MSW Active");
      await canvas.findByText("0/7 active");
      await expect(canvas.getByRole("button", { name: "all" })).toBeInTheDocument();
      await expect(canvas.getAllByTestId("operation-row")).toHaveLength(7);
    });
    await step("Select operation", async () => {
      const row = canvas.getByRole("button", { name: "GET /api/users" });
      await userEvent.click(row);
      await expect(args.onSelectOperation).toHaveBeenCalledWith("GET /api/users");
    });
    await step("Toggle operation mock", async () => {
      const toggle = canvas.getByRole("button", { name: "Toggle GET /api/users mock" });
      await expect(toggle).toHaveAttribute("aria-pressed", "false");
      await userEvent.click(toggle);
      await expect(toggle).toHaveAttribute("aria-pressed", "true");
      await expect(canvas.getByText("1/7 active")).toBeInTheDocument();
    });
    await step("Enable all mocks", async () => {
      await userEvent.click(canvas.getByText("All On"));
      await waitFor(() => {
        expect(canvas.getByText("7/7 active")).toBeInTheDocument();
      });
    });
    await step("Filter to REST", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "rest" }));
      await waitFor(() => {
        expect(canvas.getAllByTestId("operation-row")).toHaveLength(5);
      });
      await expect(canvas.queryByText("GetUsers")).not.toBeInTheDocument();
    });
    await step("Filter to GraphQL", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "graphql" }));
      await waitFor(() => {
        expect(canvas.getAllByTestId("operation-row")).toHaveLength(2);
      });
      await expect(canvas.getByText("GetUsers")).toBeInTheDocument();
      await expect(canvas.getByText("CreateUser")).toBeInTheDocument();
    });
  },
};

export const Empty: Story = {
  decorators: [withMockSeed({ descriptors: [] })],
  play: async ({ canvas, step }) => {
    await step("Verify empty state", async () => {
      await canvas.findByText("MSW Active");
      await canvas.findByText("0/0 active");
      await expect(canvas.queryAllByTestId("operation-row")).toHaveLength(0);
    });
  },
};

export const AllEnabled: Story = {
  decorators: [
    withMockSeed({
      operations: buildOperations(allDescriptors, enabledConfig),
    }),
  ],
  play: async ({ canvas, step }) => {
    await step("Verify all enabled", async () => {
      await canvas.findByText("7/7 active");
      const toggles = canvas.getAllByRole("button", { name: /Toggle .* mock/ });
      for (const toggle of toggles) {
        await expect(toggle).toHaveAttribute("aria-pressed", "true");
      }
    });
  },
};

export const WithLiveBadges: Story = {
  decorators: [
    withMockSeed({
      seenOperations: new Set(["GET /api/users", "POST /api/users"]),
    }),
  ],
  play: async ({ canvas, step }) => {
    await step("Verify live badges", async () => {
      await canvas.findByText("MSW Active");
      await waitFor(() => {
        expect(canvas.getAllByText("LIVE")).toHaveLength(2);
      });
    });
  },
};

export const WithSelection: Story = {
  args: { selectedOperation: "GET /api/users" },
  decorators: [withMockSeed()],
  play: async ({ canvas, step }) => {
    await step("Verify selection highlight", async () => {
      await canvas.findByText("0/7 active");
      const selectedRow = canvas.getByRole("button", { name: "GET /api/users" });
      await expect(selectedRow).toBeInTheDocument();
      const style = getComputedStyle(selectedRow);
      await expect(style.borderLeft).toContain("2px");
    });
  },
};
