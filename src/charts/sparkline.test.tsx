import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Sparkline } from "./sparkline.js"

const point = (label: string, value: number) => ({ label, value })

describe("Sparkline below two points (finding 24)", () => {
  it("draws nothing for a single point and says why", () => {
    const { container } = render(<Sparkline data={[point("Mon", 3)]} />)

    expect(container.querySelectorAll("svg")).toHaveLength(0)
    expect(container.querySelectorAll("circle")).toHaveLength(0)
    expect(screen.getByText("Not enough data yet")).toBeTruthy()
  })

  it("says the same for an empty series rather than collapsing to nothing", () => {
    render(<Sparkline data={[]} />)

    expect(screen.getByText("Not enough data yet")).toBeTruthy()
  })

  it("lets the consumer word it", () => {
    render(<Sparkline data={[point("Mon", 3)]} notEnoughDataLabel="One day so far" />)

    expect(screen.getByText("One day so far")).toBeTruthy()
    expect(screen.queryByText("Not enough data yet")).toBeNull()
  })

  it("is not hidden from a screen reader, unlike the chart it replaces", () => {
    const { container } = render(<Sparkline data={[point("Mon", 3)]} />)

    expect(container.querySelector("[aria-hidden='true']")).toBeNull()
  })

  it("draws the chart again as soon as there are two points", () => {
    const { container } = render(<Sparkline data={[point("Mon", 3), point("Tue", 5)]} />)

    expect(screen.queryByText("Not enough data yet")).toBeNull()
    // The chart wrapper is decorative: the number it sits under states the value.
    expect(container.querySelector("[aria-hidden='true']")).not.toBeNull()
  })
})
