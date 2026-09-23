import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { StackedBar } from "./stacked-bar.js"

const SEGMENTS = [
  { key: "passed", label: "Passed", value: 30, tone: "success" as const },
  { key: "review", label: "Needs review", value: 10, tone: "warning" as const },
  { key: "failed", label: "Failed", value: 0, tone: "danger" as const },
]

describe("StackedBar", () => {
  it("is a named group whose legend states every value and share", () => {
    render(<StackedBar label="Outcome" segments={SEGMENTS} />)

    const group = screen.getByRole("group", { name: "Outcome" })
    expect(within(group).getByText("Passed")).toBeTruthy()
    expect(within(group).getByText("75%")).toBeTruthy()
    expect(within(group).getByText("25%")).toBeTruthy()
  })

  /* Live walk, 2026-09-23: a count of 13 at 3% was announced "133%" — the
   * count and the share were adjacent text with only a margin between them. */
  it("reads each legend entry as label, count and share, not as one run-on number", () => {
    render(
      <StackedBar
        label="Leads by status"
        segments={[
          { key: "new", label: "New", value: 13 },
          { key: "won", label: "Won", value: 387 },
        ]}
      />,
    )

    const entries = within(screen.getByRole("group", { name: "Leads by status" })).getAllByRole("listitem")
    expect(entries.map((entry) => entry.textContent)).toEqual(["New: 13, 3%", "Won: 387, 97%"])
  })

  it("adds no share separator when the share is off", () => {
    render(<StackedBar label="Outcome" segments={SEGMENTS} showPercent={false} />)

    expect(screen.getAllByRole("listitem")[0]!.textContent).toBe("Passed: 30")
  })

  it("draws a segment per non-zero value, sized by its share, and hides the drawing", () => {
    const { container } = render(<StackedBar label="Outcome" segments={SEGMENTS} />)

    const bar = container.querySelector('[aria-hidden="true"]')!
    const parts = [...bar.children] as HTMLElement[]
    expect(parts).toHaveLength(2)
    expect(parts[0]!.style.flex).toBe("0.75 1 0%")
    expect(parts[0]!.style.backgroundColor).toBe("var(--color-success)")
  })

  it("selects through the legend, which is the keyboard path", () => {
    const onSelect = vi.fn()
    render(<StackedBar label="Outcome" segments={SEGMENTS} onSelect={onSelect} />)

    fireEvent.click(screen.getByRole("button", { name: /Needs review/ }))
    expect(onSelect).toHaveBeenCalledWith("review")
  })

  it("keeps the numbers in the page when the legend is off", () => {
    const { container } = render(<StackedBar label="Outcome" segments={SEGMENTS} legend={false} />)

    const hidden = container.querySelector("ul.sr-only")!
    expect(hidden.textContent).toContain("Passed: 30 (75%)")
  })

  it("draws an empty track when every value is zero", () => {
    const { container } = render(
      <StackedBar label="Outcome" segments={[{ key: "a", label: "A", value: 0 }]} />,
    )

    expect(container.querySelector(".bg-chart-track")).not.toBeNull()
  })
})
