"use client"

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
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

export interface BarChartProps<T extends object> {
  data: T[]
  height?: number
  loading?: boolean
  series: ChartSeries[]
  valueFormatter?: (value: number) => string
  xFormatter?: (value: string) => string
  xKey: keyof T & string
}

export function BarChart<T extends object>({
  data,
  height = 280,
  loading = false,
  series,
  valueFormatter = (value) => String(value),
  xFormatter = (value) => value,
  xKey,
}: BarChartProps<T>) {
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
      data={data}
      height={height}
      loading={loading}
      legend={resolvedSeries}
      rowKey={(row) => String((row as Record<string, unknown>)[xKey])}
      tableColumns={tableColumns}
      emptyTitle="No data yet"
      emptyDescription="Outcomes will appear here once leads start closing."
      renderChart={() => (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
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
              axisLine={false}
              tickLine={false}
              width={36}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "var(--color-surface-sunken)" }}
              content={
                <ChartTooltip
                  labelFormatter={(label) => xFormatter(label)}
                  valueFormatter={(value) => valueFormatter(Number(value))}
                />
              }
            />
            {resolvedSeries.map((entry) => (
              <Bar
                key={entry.key}
                dataKey={entry.key}
                name={entry.label}
                fill={entry.color}
                radius={[3, 3, 0, 0]}
                maxBarSize={28}
                /* Off, like DonutChart and Sparkline already are. Recharts'
                 * draw-in animation ignores prefers-reduced-motion, and a line
                 * that only exists once the animation has run is invisible in a
                 * background tab, in print, and to screenshot tooling — the
                 * path renders with a near-zero stroke-dasharray and stays
                 * there while rAF is suspended. */
                isAnimationActive={false}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      )}
    />
  )
}
