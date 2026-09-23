import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ProgressRing } from "./progress-ring.js"

describe("ProgressRing", () => {
  it("is a named meter carrying its value, limit and spoken value", () => {
    render(<ProgressRing label="Plan usage" value={320} max={500} />)

    const meter = screen.getByRole("meter", { name: "Plan usage" })
    expect(meter.getAttribute("aria-valuenow")).toBe("320")
    expect(meter.getAttribute("aria-valuemax")).toBe("500")
    expect(meter.getAttribute("aria-valuetext")).toBe("320 of 500")
    expect(screen.getByText("64%")).toBeTruthy()
  })

  it("prints a share over the limit, while the arc stops at full", () => {
    const { container } = render(<ProgressRing label="Plan usage" value={600} max={500} />)

    expect(screen.getByText("120%")).toBeTruthy()
    const arc = container.querySelectorAll("circle")[1]!
    const [drawn, circumference] = arc.getAttribute("stroke-dasharray")!.split(" ").map(Number)
    expect(drawn).toBe(circumference)
  })

  it("draws no arc at zero — a round cap would otherwise leave a dot", () => {
    const { container } = render(<ProgressRing label="Setup" value={0} />)

    expect(container.querySelectorAll("circle")).toHaveLength(1)
  })

  it("takes its own centre text, spoken value and caption", () => {
    render(<ProgressRing label="Score" value={82} valueLabel="82" valueText="82 out of 100" caption="of 100" size="lg" />)

    expect(screen.getByText("82")).toBeTruthy()
    expect(screen.getByText("of 100")).toBeTruthy()
    expect(screen.getByRole("meter").getAttribute("aria-valuetext")).toBe("82 out of 100")
  })

  it("drops the caption at a size with no room for it", () => {
    render(<ProgressRing label="Score" value={82} caption="of 100" size="sm" />)

    expect(screen.queryByText("of 100")).toBeNull()
  })

  it("hides the drawing from assistive technology", () => {
    const { container } = render(<ProgressRing label="Setup" value={3} max={5} />)

    expect(container.querySelector("svg")!.getAttribute("aria-hidden")).toBe("true")
  })
})
