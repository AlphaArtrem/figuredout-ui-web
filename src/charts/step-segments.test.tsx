import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { StepSegments } from "./step-segments.js"

const filled = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLElement>("[aria-hidden] > span")].filter((segment) => segment.style.backgroundColor)

describe("StepSegments", () => {
  it("draws one segment per step, fills the done ones and prints the count", () => {
    const { container } = render(<StepSegments label="Fields collected" value={5} total={7} />)

    const meter = screen.getByRole("meter", { name: "Fields collected" })
    expect(meter.getAttribute("aria-valuetext")).toBe("5 of 7")
    expect(container.querySelectorAll("[aria-hidden] > span")).toHaveLength(7)
    expect(filled(container)).toHaveLength(5)
    expect(screen.getByText("5/7")).toBeTruthy()
  })

  it("is warning until complete and success once complete, by default", () => {
    const { container, rerender } = render(<StepSegments label="Fields" value={2} total={3} />)
    expect(filled(container)[0]!.style.backgroundColor).toBe("var(--color-warning)")

    rerender(<StepSegments label="Fields" value={3} total={3} />)
    expect(filled(container)[0]!.style.backgroundColor).toBe("var(--color-success)")
  })

  it("takes an explicit tone and can hide the count", () => {
    const { container } = render(<StepSegments label="Fields" value={1} total={3} tone="info" showCount={false} />)

    expect(filled(container)[0]!.style.backgroundColor).toBe("var(--color-info)")
    expect(screen.queryByText("1/3")).toBeNull()
  })

  it("clamps a value past the total", () => {
    render(<StepSegments label="Fields" value={9} total={3} />)

    expect(screen.getByText("3/3")).toBeTruthy()
  })
})
