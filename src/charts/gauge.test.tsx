import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Gauge } from "./gauge.js"

describe("Gauge", () => {
  it("is a named meter with the figure in the page", () => {
    render(<Gauge label="Health" value={72} caption="health score" />)

    const meter = screen.getByRole("meter", { name: "Health" })
    expect(meter.getAttribute("aria-valuetext")).toBe("72 of 100")
    expect(screen.getByText("72")).toBeTruthy()
    expect(screen.getByText("health score")).toBeTruthy()
  })

  it("draws and speaks a marker when given one", () => {
    const { container } = render(
      <Gauge label="Utilisation" value={40} max={80} marker={60} markerLabel="goal" valueFormatter={(v) => `${v}h`} />,
    )

    expect(screen.getByRole("meter").getAttribute("aria-valuetext")).toBe("40h of 80h, goal 60h")
    expect(container.querySelector("line")).not.toBeNull()
  })

  it("draws only the track at zero", () => {
    const { container } = render(<Gauge label="Health" value={0} />)

    expect(container.querySelectorAll("path")).toHaveLength(1)
    expect(container.querySelector("line")).toBeNull()
  })
})
