import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, waitFor } from "storybook/test";
import { withMockSeed } from "#/plugin/__stories__/decorators";
import { allDescriptors, buildOperations, enabledConfig } from "#/plugin/__stories__/fixtures";
import { theme } from "#/plugin/theme";
import { GroupedOperationList } from "./grouped-operation-list";

const meta: Meta<typeof GroupedOperationList> = {
  title: "Operation List/GroupedOperationList",
  component: GroupedOperationList,
  decorators: [
    (Story) => (
      <div
        style={{
          background: theme.colors.background,
          height: "400px",
          width: "280px",
        }}
      >
        <Story />
      </div>
    ),
  ],
  args: {
    descriptors: allDescriptors,
    grouped: true,
    onSelectOperation: fn(),
    operations: buildOperations(allDescriptors),
    seenOperations: new Set<string>(),
    selectedOperation: null,
    setEnabled: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof GroupedOperationList>;

export const Grouped: Story = {
  decorators: [withMockSeed()],
  play: async ({ canvas, userEvent, step }) => {
    await step("Verify all rows rendered", async () => {
      await waitFor(() => {
        expect(canvas.getAllByTestId("operation-row")).toHaveLength(7);
      });
    });
    await step("Collapse group hides rows", async () => {
      const initialCount = canvas.getAllByTestId("operation-row").length;
      const headers = canvas.getAllByRole("button").filter((el) => {
        const text = el.textContent ?? "";
        return text.includes("Users") || text.includes("Products");
      });
      if (headers.length > 0) {
        await userEvent.click(headers[0]);
        await waitFor(() => {
          expect(canvas.getAllByTestId("operation-row").length).toBeLessThan(initialCount);
        });
      }
    });
  },
};

export const FlatList: Story = {
  args: { grouped: false },
  decorators: [withMockSeed()],
  play: async ({ canvas, step }) => {
    await step("Verify flat list rendered", async () => {
      await waitFor(() => {
        expect(canvas.getAllByTestId("operation-row")).toHaveLength(7);
      });
    });
  },
};

export const WithSelection: Story = {
  args: { selectedOperation: "GET /api/users" },
  decorators: [withMockSeed()],
  play: async ({ canvas, userEvent, step, args }) => {
    await step("Verify selection highlight", async () => {
      await waitFor(() => {
        expect(canvas.getAllByTestId("operation-row").length).toBeGreaterThan(0);
      });
      const selectedRow = canvas.getByRole("button", { name: "GET /api/users" });
      await expect(selectedRow).toBeInTheDocument();
      const style = getComputedStyle(selectedRow);
      await expect(style.borderLeft).toContain("2px");
    });
    await step("Select operation triggers callback", async () => {
      const row = canvas.getByRole("button", { name: "GET /api/users" });
      await userEvent.click(row);
      await expect(args.onSelectOperation).toHaveBeenCalledWith("GET /api/users");
    });
    await step("Toggle operation triggers callback", async () => {
      const toggle = canvas.getByRole("button", { name: "Toggle GET /api/users mock" });
      await userEvent.click(toggle);
      await expect(args.setEnabled).toHaveBeenCalled();
    });
  },
};

export const Empty: Story = {
  args: { descriptors: [], operations: {} },
  play: async ({ canvas, step }) => {
    await step("Verify empty state", async () => {
      await expect(canvas.queryAllByTestId("operation-row")).toHaveLength(0);
    });
  },
};

export const AllEnabled: Story = {
  args: {
    operations: buildOperations(allDescriptors, enabledConfig),
  },
  decorators: [withMockSeed({ operations: buildOperations(allDescriptors, enabledConfig) })],
  play: async ({ canvas, step }) => {
    await step("Verify all toggles enabled", async () => {
      await waitFor(() => {
        expect(canvas.getAllByTestId("operation-row").length).toBeGreaterThan(0);
      });
      const toggles = canvas.getAllByRole("button", { name: /Toggle .* mock/ });
      for (const toggle of toggles) {
        await expect(toggle).toHaveAttribute("aria-pressed", "true");
      }
    });
  },
};
