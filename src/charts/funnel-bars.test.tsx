import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { FunnelBars } from "./funnel-bars.js"

const ENTRIES = [
  { key: "new", label: "New", count: 6 },
  { key: "won", label: "Won", count: 2 },
]

describe("FunnelBars label (finding 114)", () => {
  it("still calls itself a lead pipeline when nobody says otherwise", () => {
    render(<FunnelBars entries={ENTRIES} />)

    expect(screen.getByRole("table", { name: "Pipeline by status" })).toBeTruthy()
  })

  it("takes the name of whatever it is actually breaking down", () => {
    render(<FunnelBars entries={ENTRIES} label="Trial funnel by step" />)

    expect(screen.getByRole("table", { name: "Trial funnel by step" })).toBeTruthy()
    expect(screen.queryByRole("table", { name: "Pipeline by status" })).toBeNull()
  })

  it("leaves the maths alone — each bar is still its share of the total", () => {
    // Finding 111 is phase 24's; this pins that the label change did not touch it.
    render(<FunnelBars entries={ENTRIES} label="Trial funnel by step" />)

    expect(screen.getByText("(75%)")).toBeTruthy()
    expect(screen.getByText("(25%)")).toBeTruthy()
  })
})

describe("FunnelBars denominator (finding 111)", () => {
  it("defaults to the sum of the counts, so a disjoint breakdown still adds to 100%", () => {
    render(<FunnelBars entries={ENTRIES} />)

    expect(screen.getByText("(75%)")).toBeTruthy()
    expect(screen.getByText("(25%)")).toBeTruthy()
  })

  it("takes each count as a share of the denominator it is given", () => {
    // A funnel: nested subsets of one population, so the first step is 100% of
    // itself and the shares do not add up to 100% by construction.
    const steps = [
      { key: "signed-up", label: "Signed up", count: 8 },
      { key: "onboarded", label: "Finished onboarding", count: 4 },
      { key: "converted", label: "Converted", count: 2 },
    ]

    render(<FunnelBars entries={steps} total={steps[0]!.count} label="Trial funnel by step" />)

    expect(screen.getByText("(100%)")).toBeTruthy()
    expect(screen.getByText("(50%)")).toBeTruthy()
    expect(screen.getByText("(25%)")).toBeTruthy()
  })

  it("prints a share over 100% rather than hiding it, and stops the bar at full width", () => {
    // Real data does this: an organization can convert without ever having
    // tried the bot, so a later step can exceed an earlier one.
    const { container } = render(
      <FunnelBars
        entries={[
          { key: "tried", label: "Tried the bot", count: 1 },
          { key: "converted", label: "Converted", count: 2 },
        ]}
        total={1}
      />,
    )

    expect(screen.getByText("(200%)")).toBeTruthy()
    const widths = [...container.querySelectorAll<HTMLElement>(".col-span-2 > span")].map(
      (bar) => bar.style.width,
    )
    expect(widths).toEqual(["100%", "100%"])
  })

  it("still says it has nothing when every count is zero, whatever the denominator", () => {
    render(
      <FunnelBars
        entries={[{ key: "a", label: "A", count: 0 }]}
        total={12}
        emptyTitle="Nothing rolled up yet"
      />,
    )

    expect(screen.getByText("Nothing rolled up yet")).toBeTruthy()
  })
})
