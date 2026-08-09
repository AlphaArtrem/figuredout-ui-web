import type { Preview } from "@storybook/react-vite"
import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"
import { ToastProvider } from "../src/patterns/toast"
import "./preview.css"

function StoryShell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <ToastProvider>
        <div className="min-h-screen bg-background p-6 text-fg md:p-10">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </div>
      </ToastProvider>
    </ThemeProvider>
  )
}

const preview: Preview = {
  decorators: [
    (Story) => (
      <StoryShell>
        <Story />
      </StoryShell>
    ),
  ],
  parameters: {
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "surface",
      values: [
        { name: "surface", value: "var(--color-bg)" },
        { name: "raised", value: "var(--color-surface-raised)" },
        { name: "dark", value: "#121110" },
      ],
    },
    docs: {
      toc: true,
    },
  },
}

export default preview
