import { render } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

/* jsdom lays nothing out, so a ResponsiveContainer never gives the plot a size
 * and the axis never renders its ticks. What this pins is the wiring: the props
 * `LineChart` hands the value axis. The rendered widths are measured in the
 * consuming app, where there is a layout engine. */
const axis = vi.hoisted(() => ({ props: null as null | Record<string, unknown> }))

vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>()
  const Pass = ({ children }: { children?: ReactNode }) => <div>{children}</div>
  return {
    ...actual,
    ResponsiveContainer: Pass,
    LineChart: Pass,
    CartesianGrid: () => null,
    Line: () => null,
    Tooltip: () => null,
    XAxis: () => null,
    YAxis: (props: Record<string, unknown>) => {
      axis.props = props
      return null
    },
  }
})

const { LineChart } = await import("./line-chart.js")

const data = [
  { date: "2026-08-29", mrr: 1250 },
  { date: "2026-08-30", mrr: 173.17 },
]

describe("LineChart's value axis", () => {
  it("formats its ticks with the chart's valueFormatter", () => {
    render(
      <LineChart
        data={data}
        xKey="date"
        series={[{ key: "mrr", label: "MRR" }]}
        valueFormatter={(value) => `$${value.toLocaleString("en-US")}`}
      />,
    )

    const format = axis.props?.tickFormatter as (value: unknown) => string
    expect(format(1250)).toBe("$1,250")
  })

  it("sizes itself to its widest tick rather than a hardcoded 36 px", () => {
    render(<LineChart data={data} xKey="date" series={[{ key: "mrr", label: "MRR" }]} />)

    expect(axis.props?.width).toBe("auto")
  })

  it("prints the plain number when no formatter is given", () => {
    render(<LineChart data={data} xKey="date" series={[{ key: "mrr", label: "MRR" }]} />)

    const format = axis.props?.tickFormatter as (value: unknown) => string
    expect(format(45)).toBe("45")
  })
})
