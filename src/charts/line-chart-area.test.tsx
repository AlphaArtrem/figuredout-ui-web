import { render } from "@testing-library/react"
import type { ReactNode } from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"

/* jsdom lays nothing out, so recharts draws nothing; what this pins is the
 * wiring — which marks LineChart hands recharts for each option. */
const seen = vi.hoisted(() => ({
  charts: [] as string[],
  areas: [] as Record<string, unknown>[],
  lines: [] as Record<string, unknown>[],
  guides: [] as Record<string, unknown>[],
  dots: [] as Record<string, unknown>[],
}))

vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>()
  const chart = (name: string) => ({ children }: { children?: ReactNode }) => {
    seen.charts.push(name)
    return <div>{children}</div>
  }
  const record = (list: Record<string, unknown>[]) => (props: Record<string, unknown>) => {
    list.push(props)
    return null
  }
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    LineChart: chart("line"),
    AreaChart: chart("area"),
    CartesianGrid: () => null,
    Tooltip: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Area: record(seen.areas),
    Line: record(seen.lines),
    ReferenceLine: record(seen.guides),
    ReferenceDot: record(seen.dots),
  }
})

const { LineChart } = await import("./line-chart.js")

const data = [
  { week: "W1", won: 3, lost: 1 },
  { week: "W2", won: 7, lost: 2 },
  { week: "W3", won: 5, lost: 4 },
]
const series = [
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
]

beforeEach(() => {
  for (const list of Object.values(seen)) list.length = 0
})

describe("LineChart area", () => {
  it("stays a line chart by default", () => {
    render(<LineChart data={data} xKey="week" series={series} />)

    expect(seen.charts).toEqual(["line"])
    expect(seen.lines).toHaveLength(2)
    expect(seen.areas).toHaveLength(0)
  })

  it("fills under each series in its own colour, without animating", () => {
    render(<LineChart data={data} xKey="week" series={series} area />)

    expect(seen.charts).toEqual(["area"])
    expect(seen.areas.map((props) => props.fill)).toEqual(["var(--chart-cat-1)", "var(--chart-cat-2)"])
    expect(seen.areas.every((props) => props.isAnimationActive === false)).toBe(true)
  })
})

describe("LineChart highlightIndex", () => {
  it("draws a guide at that x and a dot on every series", () => {
    render(<LineChart data={data} xKey="week" series={series} highlightIndex={1} />)

    expect(seen.guides.map((props) => props.x)).toEqual(["W2"])
    expect(seen.dots.map((props) => [props.x, props.y])).toEqual([
      ["W2", 7],
      ["W2", 2],
    ])
  })

  it("draws nothing for an index outside the data", () => {
    render(<LineChart data={data} xKey="week" series={series} highlightIndex={9} />)

    expect(seen.guides).toHaveLength(0)
    expect(seen.dots).toHaveLength(0)
  })
})
