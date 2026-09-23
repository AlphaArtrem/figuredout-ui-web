import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { RankedBars } from "./ranked-bars.js"

const ITEMS = [
  { key: "web", label: "Website", value: 40 },
  { key: "ads", label: "Ads", value: 20, tone: "warning" as const, meta: "3 campaigns" },
]

const widths = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLElement>(".col-span-2 > span")].map((bar) => bar.style.width)

describe("RankedBars", () => {
  it("scales to the largest value by default", () => {
    const { container } = render(<RankedBars label="Leads by source" items={ITEMS} />)

    expect(screen.getByRole("table", { name: "Leads by source" })).toBeTruthy()
    expect(widths(container)).toEqual(["100%", "50%"])
  })

  it("takes a fixed scale, and stops a value past it at full width", () => {
    const { container } = render(
      <RankedBars label="Scores" max={30} items={ITEMS} valueFormatter={(value) => `${value} pts`} />,
    )

    expect(widths(container)).toEqual(["100%", "66.66666666666666%"])
    expect(screen.getByText("40 pts")).toBeTruthy()
  })

  it("prints meta beside the value and colours a toned bar", () => {
    const { container } = render(<RankedBars label="Leads by source" items={ITEMS} />)

    expect(screen.getByText("3 campaigns")).toBeTruthy()
    const bars = container.querySelectorAll<HTMLElement>(".col-span-2 > span")
    expect(bars[1]!.style.backgroundColor).toBe("var(--color-warning)")
  })

  it("keeps table semantics when selectable, with a real button named by the label", () => {
    const onSelect = vi.fn()
    render(<RankedBars label="Leads by source" items={ITEMS} onSelect={onSelect} />)

    expect(screen.getAllByRole("row")).toHaveLength(2)
    fireEvent.click(screen.getByRole("button", { name: "Ads" }))
    expect(onSelect).toHaveBeenCalledWith("ads")
  })

  it("has an empty state", () => {
    render(<RankedBars label="Leads by source" items={[]} emptyTitle="Nothing yet" />)

    expect(screen.getByText("Nothing yet")).toBeTruthy()
  })
})
