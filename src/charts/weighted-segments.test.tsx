import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { WeightedSegments } from "./weighted-segments.js"

const SEGMENTS = [
  { key: "budget", label: "Budget", value: 40, weight: 40 },
  { key: "area", label: "Area", value: 15, weight: 30 },
  { key: "timing", label: "Timing", value: 0, weight: 30 },
]

describe("WeightedSegments", () => {
  it("sizes each segment by its weight and fills it by what was earned", () => {
    const { container } = render(<WeightedSegments label="Score by criterion" segments={SEGMENTS} />)

    const strip = container.querySelector('[aria-hidden="true"]')!
    const parts = [...strip.children] as HTMLElement[]
    expect(parts.map((part) => part.style.flex)).toEqual(["40 1 0%", "30 1 0%", "30 1 0%"])
    expect(parts.map((part) => (part.firstElementChild as HTMLElement).style.width)).toEqual(["100%", "50%", "0%"])
  })

  it("lists every criterion with what it earned, spoken as 'of'", () => {
    render(<WeightedSegments label="Score by criterion" segments={SEGMENTS} />)

    const list = screen.getByRole("list", { name: "Score by criterion" })
    expect(list.textContent).toContain("Area15/3015 of 30")
    expect(screen.getByText("15/30").className).toBe("")
  })

  it("hatches the shortfall in warning by default, and not when neutral", () => {
    const { container, rerender } = render(<WeightedSegments label="Score" segments={SEGMENTS} />)
    expect(container.querySelectorAll(".bg-warning-soft")).toHaveLength(2)

    rerender(<WeightedSegments label="Score" segments={SEGMENTS} shortfall="neutral" />)
    expect(container.querySelectorAll(".bg-warning-soft")).toHaveLength(0)
  })

  it("keeps the labels for a screen reader when they are hidden", () => {
    render(<WeightedSegments label="Score" segments={SEGMENTS} showLabels={false} />)

    expect(screen.getByRole("list", { name: "Score" }).className).toContain("sr-only")
  })
})
