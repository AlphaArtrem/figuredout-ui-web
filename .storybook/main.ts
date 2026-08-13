import type { StorybookConfig } from "@storybook/react-vite"

const config: StorybookConfig = {
  /* `*.mdx` as well as `*.stories.*`, so the Introduction page is picked up. */
  stories: ["../stories/**/*.mdx", "../stories/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
}

export default config
