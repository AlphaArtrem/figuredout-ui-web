import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Legend } from "./legend.js"
import { LineChart } from "./line-chart.js"

const ITEMS = [
  { key: "won", label: "Won", value: "12" },
  { key: "lost", label: "Lost", value: "4" },
]

describe("Legend", () => {
  /* A screen reader reads the entry's text in order, so adjacent label and value
   * nodes ran together ("Won12"). The separator is visually hidden: the gap on
   * screen is layout and stays as it was. */
  it("separates each entry's label from its value in the text a screen reader reads", () => {
    render(<Legend items={ITEMS} label="Outcome" />)

    const list = screen.getByRole("list", { name: "Outcome" })
    const entries = within(list).getAllByRole("listitem")
    expect(entries.map((entry) => entry.textContent)).toEqual(["Won: 12", "Lost: 4"])
    expect(within(list).getAllByText(":", { exact: false, selector: ".sr-only" })).toHaveLength(2)
    expect(screen.queryByRole("button")).toBeNull()
  })

  it("adds no separator to an entry without a value", () => {
    render(<Legend items={[{ key: "a", label: "Accepted" }]} label="Series" />)

    expect(screen.getByRole("listitem").textContent).toBe("Accepted")
  })

  it("makes every entry a button when it can select", () => {
    const onSelect = vi.fn()
    render(<Legend items={ITEMS} onSelect={onSelect} />)

    /* jsdom's name computation spaces every child element; a browser joins
     * inline text as written. Either way the separator is in the name. */
    fireEvent.click(screen.getByRole("button", { name: /^Lost ?: 4$/ }))
    expect(onSelect).toHaveBeenCalledWith("lost")
  })

  it("is still the legend ChartShell draws for a multi-series chart", () => {
    render(
      <LineChart
        data={[
          { day: "1", a: 1, b: 2 },
          { day: "2", a: 3, b: 1 },
        ]}
        xKey="day"
        series={[
          { key: "a", label: "Accepted" },
          { key: "b", label: "Rejected" },
        ]}
      />,
    )

    expect(screen.getByText("Accepted")).toBeTruthy()
    expect(screen.getByText("Rejected")).toBeTruthy()
  })
})
