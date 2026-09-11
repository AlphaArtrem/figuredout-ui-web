import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { LineChart } from "./line-chart.js"

const series = [{ key: "count", label: "New leads" }]
const day = (date: string, count: number) => ({ date, count })

describe("LineChart below two points", () => {
  it("draws nothing for a single point and says why", () => {
    const { container } = render(<LineChart data={[day("2026-08-30", 3)]} xKey="date" series={series} />)

    expect(screen.getByText("Not enough data yet")).toBeTruthy()
    expect(container.querySelectorAll("svg")).toHaveLength(1) // the table glyph, not a plot
    expect(container.querySelectorAll("circle")).toHaveLength(0)
    expect(container.querySelector(".recharts-responsive-container")).toBeNull()
  })

  it("still lets the one value be read as a table", () => {
    render(
      <LineChart
        data={[day("2026-08-30", 1250)]}
        xKey="date"
        series={series}
        valueFormatter={(value) => `$${value.toLocaleString("en-US")}`}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "View as table" }))
    expect(screen.getByText("$1,250")).toBeTruthy()
  })

  it("lets the consumer word it", () => {
    render(<LineChart data={[day("2026-08-30", 3)]} xKey="date" series={series} notEnoughDataLabel="One day so far" />)

    expect(screen.getByText("One day so far")).toBeTruthy()
  })

  it("keeps the empty state for an empty series, as before", () => {
    render(<LineChart data={[]} xKey="date" series={series} />)

    expect(screen.getByText("No trend data yet")).toBeTruthy()
    expect(screen.queryByText("Not enough data yet")).toBeNull()
  })

  it("draws the chart as soon as there are two points", () => {
    const { container } = render(
      <LineChart data={[day("2026-08-29", 1), day("2026-08-30", 3)]} xKey="date" series={series} />,
    )

    expect(screen.queryByText("Not enough data yet")).toBeNull()
    expect(container.querySelector(".recharts-responsive-container")).not.toBeNull()
  })
})

describe("LineChart's axis caption", () => {
  it("states the unit above the plot when given one", () => {
    render(
      <LineChart
        data={[day("2026-08-29", 1), day("2026-08-30", 3)]}
        xKey="date"
        series={series}
        yAxisLabel="US dollars"
      />,
    )

    expect(screen.getByText("US dollars")).toBeTruthy()
  })

  it("renders no caption when none is given", () => {
    const { container } = render(
      <LineChart data={[day("2026-08-29", 1), day("2026-08-30", 3)]} xKey="date" series={series} />,
    )

    expect(container.querySelector("p.uppercase")).toBeNull()
  })
})
