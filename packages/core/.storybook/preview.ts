import type { Preview } from "@storybook/react";
import { ensurePluginStyles } from "../src/plugin/plugin-styles";
import { theme } from "../src/plugin/theme";

ensurePluginStyles();

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: theme.colors.background }],
    },
    layout: "fullscreen",
  },
};

export default preview;
