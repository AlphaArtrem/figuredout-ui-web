import { render, screen, within } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Heatmap } from "./heatmap.js"

const ROWS = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
]
const COLUMNS = [
  { key: "am", label: "AM" },
  { key: "pm", label: "PM" },
]

describe("Heatmap", () => {
  it("is a captioned table with row and column headers", () => {
    render(<Heatmap label="Messages by day" rows={ROWS} columns={COLUMNS} values={[[1, 4], [0, null]]} />)

    const table = screen.getByRole("table", { name: "Messages by day" })
    expect(within(table).getByRole("columnheader", { name: "PM" })).toBeTruthy()
    expect(within(table).getByRole("rowheader", { name: "Tue" })).toBeTruthy()
  })

  it("keeps every value in the page, and says which cells have none", () => {
    render(<Heatmap label="Messages" rows={ROWS} columns={COLUMNS} values={[[1, 4], [0, null]]} />)

    // The first cell is the empty corner above the row headers.
    const cells = screen.getAllByRole("cell").slice(1)
    expect(cells.map((cell) => cell.textContent)).toEqual(["1", "4", "0", "No data"])
  })

  it("colours by value and leaves a missing cell as bare track", () => {
    const { container } = render(
      <Heatmap label="Messages" rows={ROWS} columns={COLUMNS} values={[[1, 4], [0, null]]} showScale={false} />,
    )

    const swatches = [...container.querySelectorAll<HTMLElement>("td > div")]
    expect(swatches[1]!.style.backgroundColor).toContain("100%")
    expect(swatches[2]!.style.backgroundColor).toContain("12%")
    expect(swatches[3]!.className).toContain("bg-chart-track")
  })

  it("prints values in the cells when asked", () => {
    render(<Heatmap label="Messages" rows={ROWS} columns={COLUMNS} values={[[1, 4], [0, 2]]} showValues valueFormatter={(v) => `${v}x`} />)

    const table = screen.getByRole("table")
    expect(within(table).getByText("4x").className).not.toContain("sr-only")
  })
})
