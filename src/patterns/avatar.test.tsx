import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Avatar } from "./avatar.js"

const LONG = "Alexandria Montgomery-Fitzwilliam of the Northern Territories"

describe("Avatar", () => {
  it("wraps by default, with no title and no truncation, as it always has", () => {
    const { container } = render(<Avatar name={LONG} subtitle="+44 7700 900123" />)

    const name = screen.getByText(LONG)
    expect(name.className).not.toContain("truncate")
    expect(name).not.toHaveAttribute("title")
    expect(container.firstElementChild?.className).toBe("flex items-center gap-3")
  })

  it("cuts the name and a string subtitle to one line each and keeps the full text in title", () => {
    render(<Avatar name={LONG} subtitle="+44 7700 900123 · 3 days ago" truncate />)

    const name = screen.getByText(LONG)
    expect(name.className).toContain("truncate")
    expect(name).toHaveAttribute("title", LONG)

    const subtitle = screen.getByText("+44 7700 900123 · 3 days ago")
    expect(subtitle.className).toContain("truncate")
    expect(subtitle).toHaveAttribute("title", "+44 7700 900123 · 3 days ago")
  })

  it("lets the text column shrink and keeps the circle from giving way", () => {
    const { container } = render(<Avatar name={LONG} truncate />)

    const row = container.firstElementChild as HTMLElement
    expect(row.className).toContain("min-w-0")
    expect((row.children[0] as HTMLElement).className).toContain("shrink-0")
    expect((row.children[1] as HTMLElement).className).toContain("min-w-0")
  })

  it("still renders a node subtitle in full, without inventing a title for it", () => {
    render(<Avatar name="Sam" subtitle={<span>Missing: budget</span>} truncate />)

    const subtitle = screen.getByText("Missing: budget").parentElement!
    expect(subtitle).not.toHaveAttribute("title")
  })
})
