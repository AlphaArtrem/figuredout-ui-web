import type { Config } from "tailwindcss"
import uiPreset from "./tailwind-preset"

const config: Config = {
  presets: [uiPreset],
  content: [
    "./index.ts",
    "./src/**/*.{ts,tsx}",
    "./stories/**/*.{ts,tsx,mdx}",
    "./.storybook/**/*.{ts,tsx}",
  ],
}

export default config
