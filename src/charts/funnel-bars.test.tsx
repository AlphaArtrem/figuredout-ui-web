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
