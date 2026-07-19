"use client"

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
  series: ChartSeries[]
  valueFormatter?: (value: number) => string
  xFormatter?: (value: string) => string
  xKey: keyof T & string
}

export function LineChart<T extends object>({
  data,
  height = 280,
  loading = false,
  series,
  valueFormatter = (value) => String(value),
  xFormatter = (value) => value,
  xKey,
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
      data={data}
      height={height}
      loading={loading}
      legend={resolvedSeries}
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
              axisLine={false}
              tickLine={false}
              width={36}
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
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      )}
    />
  )
}
