import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn } from "storybook/test";
import { theme } from "#/plugin/theme";
import { VariantSelector } from "./variant-selector";

const multipleVariants = [
  { id: "variant-0", label: "Default" },
  { id: "variant-1", label: "Empty list" },
  { id: "variant-2", label: "Error state" },
];

const meta: Meta<typeof VariantSelector> = {
  title: "Operation Detail/VariantSelector",
  component: VariantSelector,
  decorators: [
    (Story) => (
      <div style={{ background: theme.colors.background, padding: "12px", width: "400px" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    activeVariantId: "variant-0",
    onVariantChange: fn(),
    operationName: "GET /api/users",
    variants: [{ id: "variant-0", label: "Default" }],
  },
};

export default meta;
type Story = StoryObj<typeof VariantSelector>;

export const SingleVariant: Story = {
  play: async ({ canvas, step }) => {
    await step("Verify single variant", async () => {
      await expect(canvas.getByText("Variant")).toBeInTheDocument();
      const select = canvas.getByRole("combobox");
      await expect(select).toHaveValue("variant-0");
      const options = canvas.getAllByRole("option");
      await expect(options).toHaveLength(1);
      await expect(options[0]).toHaveTextContent("Default");
    });
  },
};

export const MultipleVariants: Story = {
  args: { variants: multipleVariants },
  play: async ({ canvas, userEvent, step, args }) => {
    await step("Verify multiple variants rendered", async () => {
      const select = canvas.getByRole("combobox");
      await expect(select).toHaveValue("variant-0");
      const options = canvas.getAllByRole("option");
      await expect(options).toHaveLength(3);
      await expect(options[0]).toHaveTextContent("Default");
      await expect(options[1]).toHaveTextContent("Empty list");
      await expect(options[2]).toHaveTextContent("Error state");
    });
    await step("Change variant", async () => {
      const select = canvas.getByRole("combobox");
      await userEvent.selectOptions(select, "variant-1");
      await expect(args.onVariantChange).toHaveBeenCalled();
    });
    await step("Change to error state variant", async () => {
      const select = canvas.getByRole("combobox");
      await userEvent.selectOptions(select, "variant-2");
      await expect(args.onVariantChange).toHaveBeenCalled();
    });
  },
};

export const NonDefaultSelected: Story = {
  name: "Non-Default Selected",
  args: {
    activeVariantId: "variant-1",
    variants: multipleVariants,
  },
  play: async ({ canvas, step }) => {
    await step("Verify non-default selected", async () => {
      const select = canvas.getByRole("combobox");
      await expect(select).toHaveValue("variant-1");
    });
  },
};
