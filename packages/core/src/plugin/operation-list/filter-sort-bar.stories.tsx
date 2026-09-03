import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn } from "storybook/test";
import { theme } from "#/plugin/theme";
import { FilterSortBar } from "./filter-sort-bar";

const meta: Meta<typeof FilterSortBar> = {
  args: {
    filter: "all",
    isGrouped: true,
    onFilterChange: fn(),
    onGroupToggle: fn(),
    onSortChange: fn(),
    sort: "default",
  },
  component: FilterSortBar,
  decorators: [
    (Story) => (
      <div style={{ background: theme.colors.background, width: "280px" }}>
        <Story />
      </div>
    ),
  ],
  title: "Operation List/FilterSortBar",
};

export default meta;
type Story = StoryObj<typeof FilterSortBar>;

export const Default: Story = {
  play: async ({ canvas, userEvent, step, args }) => {
    await step("Verify default filter state", async () => {
      const allBtn = canvas.getByRole("button", { name: "all" });
      await expect(allBtn).toHaveAttribute("aria-pressed", "true");
      await expect(canvas.getByRole("button", { name: "rest" })).toHaveAttribute(
        "aria-pressed",
        "false"
      );
      await expect(canvas.getByRole("button", { name: "graphql" })).toHaveAttribute(
        "aria-pressed",
        "false"
      );
      await expect(canvas.getByTestId("group-toggle")).toHaveAttribute("aria-pressed", "true");
      await expect(canvas.getByRole("combobox")).toHaveValue("default");
    });
    await step("Click REST filter", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "rest" }));
      await expect(args.onFilterChange).toHaveBeenCalledWith("rest");
    });
    await step("Click GraphQL filter", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "graphql" }));
      await expect(args.onFilterChange).toHaveBeenCalledWith("graphql");
    });
    await step("Click enabled filter", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "enabled" }));
      await expect(args.onFilterChange).toHaveBeenCalledWith("enabled");
    });
    await step("Click live filter", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "live" }));
      await expect(args.onFilterChange).toHaveBeenCalledWith("live");
    });
    await step("Change sort", async () => {
      const select = canvas.getByRole("combobox");
      await userEvent.selectOptions(select, "a-z");
      await expect(args.onSortChange).toHaveBeenCalled();
    });
    await step("Toggle grouping", async () => {
      await userEvent.click(canvas.getByTestId("group-toggle"));
      await expect(args.onGroupToggle).toHaveBeenCalledTimes(1);
    });
  },
};

export const FilteredByRest: Story = {
  args: { filter: "rest" },
  name: "Filtered: REST",
  play: async ({ canvas, step }) => {
    await step("Verify REST filter active", async () => {
      await expect(canvas.getByRole("button", { name: "rest" })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
      await expect(canvas.getByRole("button", { name: "all" })).toHaveAttribute(
        "aria-pressed",
        "false"
      );
    });
  },
};

export const FilteredByGraphQL: Story = {
  args: { filter: "graphql" },
  name: "Filtered: GraphQL",
  play: async ({ canvas, step }) => {
    await step("Verify GraphQL filter active", async () => {
      await expect(canvas.getByRole("button", { name: "graphql" })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
    });
  },
};

export const SortedAToZ: Story = {
  args: { sort: "a-z" },
  name: "Sorted: A to Z",
  play: async ({ canvas, step }) => {
    await step("Verify sort value", async () => {
      await expect(canvas.getByRole("combobox")).toHaveValue("a-z");
    });
  },
};

export const GroupingOff: Story = {
  args: { isGrouped: false },
  name: "Grouping Disabled",
  play: async ({ canvas, step }) => {
    await step("Verify grouping disabled", async () => {
      await expect(canvas.getByTestId("group-toggle")).toHaveAttribute("aria-pressed", "false");
    });
  },
};
