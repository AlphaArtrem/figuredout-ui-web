import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SidePanel } from "./side-panel.js"

function Panel(props: { size?: "md" | "lg" | "xl" | "2xl" }) {
  return (
    <SidePanel open onOpenChange={() => {}} title="Lead" {...props}>
      <p>Body</p>
    </SidePanel>
  )
}

describe("SidePanel size", () => {
  it("stays max-w-xl by default", () => {
    render(<Panel />)

    const panel = screen.getByRole("dialog", { name: "Lead" })
    expect(panel.className).toContain("max-w-xl")
    expect(panel.className).not.toContain("lg:max-w")
  })

  it("keeps lg at max-w-2xl", () => {
    render(<Panel size="lg" />)

    const panel = screen.getByRole("dialog", { name: "Lead" })
    expect(panel.className).toContain("max-w-2xl")
    expect(panel.className).not.toContain("lg:max-w")
  })

  it("widens xl only from lg, and stays full width below its cap", () => {
    render(<Panel size="xl" />)

    const panel = screen.getByRole("dialog", { name: "Lead" })
    expect(panel.className).toContain("w-full")
    expect(panel.className).toContain("max-w-2xl lg:max-w-4xl")
  })

  it("widens 2xl again from xl", () => {
    render(<Panel size="2xl" />)

    expect(screen.getByRole("dialog", { name: "Lead" }).className).toContain("xl:max-w-6xl")
  })
})
