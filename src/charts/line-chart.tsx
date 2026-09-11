"use client"

import type { ReactNode } from "react"
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { TableColumn } from "../patterns/table.js"
import { ChartShell } from "./chart-shell.js"
import { ChartTooltip } from "./chart-tooltip.js"
import { axisLabelColor, categoricalColor, gridColor } from "./palette.js"
import type { ChartSeries } from "./types.js"

export interface LineChartProps<T extends object> {
  data: T[]
  height?: number
  loading?: boolean
  /** What a one-point series says instead of drawing a lone dot. */
  notEnoughDataLabel?: ReactNode
  series: ChartSeries[]
  /**
   * Formats the tooltip, the table AND the value axis's ticks, so the three
   * never disagree about the unit.
   */
  valueFormatter?: (value: number) => string
  xFormatter?: (value: string) => string
  xKey: keyof T & string
  /** The unit the value axis is in — "US dollars". Rendered as a caption above the axis. */
  yAxisLabel?: ReactNode
}

/* The value axis measures its own ticks (`width="auto"`), because they are now
 * formatted: a hardcoded 36 px fitted `180` and would clip `$1,250` or push the
 * plot. Recharts sizes the axis to the widest rendered tick.
 *
 * Below two points there is no line to draw — see `ChartShell`'s
 * `notEnoughData`. An empty series keeps the shell's empty state. */
export function LineChart<T extends object>({
  data,
  height = 280,
  loading = false,
  notEnoughDataLabel = "Not enough data yet",
  series,
  valueFormatter = (value) => String(value),
  xFormatter = (value) => value,
  xKey,
  yAxisLabel,
}: LineChartProps<T>) {
  const resolvedSeries = series.map((entry, index) => ({
    ...entry,
    color: entry.color ?? categoricalColor(index),
  }))

  const tableColumns: TableColumn<T>[] = [
    { id: xKey, header: "Date", render: (row) => xFormatter(String((row as Record<string, unknown>)[xKey])) },
    ...resolvedSeries.map((entry) => ({
      id: entry.key,
      header: entry.label,
      align: "right" as const,
      render: (row: T) => valueFormatter(Number((row as Record<string, unknown>)[entry.key] ?? 0)),
    })),
  ]

  return (
    <ChartShell
      caption={yAxisLabel}
      data={data}
      height={height}
      loading={loading}
      legend={resolvedSeries}
      notEnoughData={data.length === 1 ? notEnoughDataLabel : undefined}
      rowKey={(row) => String((row as Record<string, unknown>)[xKey])}
      tableColumns={tableColumns}
      emptyTitle="No trend data yet"
      emptyDescription="Once activity starts, the trend will plot here."
      renderChart={() => (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={gridColor} vertical={false} strokeDasharray="0" />
            <XAxis
              dataKey={xKey as never}
              tickFormatter={xFormatter}
              tick={{ fill: axisLabelColor, fontSize: 11 }}
              axisLine={{ stroke: gridColor }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: axisLabelColor, fontSize: 11 }}
              tickFormatter={(value) => valueFormatter(Number(value))}
              axisLine={false}
              tickLine={false}
              width="auto"
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ stroke: gridColor, strokeWidth: 1 }}
              content={
                <ChartTooltip
                  labelFormatter={(label) => xFormatter(label)}
                  valueFormatter={(value) => valueFormatter(Number(value))}
                />
              }
            />
            {resolvedSeries.map((entry) => (
              <Line
                key={entry.key}
                type="monotone"
                dataKey={entry.key}
                name={entry.label}
                stroke={entry.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                /* Off, like DonutChart and Sparkline already are. Recharts'
                 * draw-in animation ignores prefers-reduced-motion, and a line
                 * that only exists once the animation has run is invisible in a
                 * background tab, in print, and to screenshot tooling — the
                 * path renders with a near-zero stroke-dasharray and stays
                 * there while rAF is suspended. */
                isAnimationActive={false}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      )}
    />
  )
}
