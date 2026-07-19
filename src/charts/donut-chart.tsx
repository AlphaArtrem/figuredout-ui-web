"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { EmptyState } from "../patterns/empty-state.js"
import { Skeleton } from "../primitives/skeleton.js"
import { ChartTooltip } from "./chart-tooltip.js"
import { categoricalColor } from "./palette.js"

export interface DonutChartEntry {
  color?: string
  key: string
  label: string
  value: number
}

export interface DonutChartProps {
  entries: DonutChartEntry[]
  height?: number
  loading?: boolean
  valueFormatter?: (value: number) => string
}

export function DonutChart({
  entries,
  height = 220,
  loading = false,
  valueFormatter = (value) => String(value),
}: DonutChartProps) {
  if (loading) {
    return <Skeleton style={{ height }} className="w-full rounded-full" />
  }

  const total = entries.reduce((sum, entry) => sum + entry.value, 0)
  if (entries.length === 0 || total === 0) {
    return <EmptyState title="No data yet" description="Values will appear here once available." />
  }

  const resolved = entries.map((entry, index) => ({
    ...entry,
    color: entry.color ?? categoricalColor(index),
  }))

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div style={{ height, width: height }} className="mx-auto shrink-0 sm:mx-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={<ChartTooltip valueFormatter={(value) => valueFormatter(Number(value))} />}
            />
            <Pie
              data={resolved}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="98%"
              paddingAngle={2}
              stroke="var(--color-surface)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {resolved.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex flex-1 flex-col gap-1.5">
        {resolved.map((entry) => {
          const pct = total > 0 ? (entry.value / total) * 100 : 0
          return (
            <li key={entry.key} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-1.5 truncate text-fg-muted">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.label}
              </span>
              <span className="shrink-0 font-mono tabular-nums text-fg">
                {valueFormatter(entry.value)} <span className="text-fg-subtle">({pct.toFixed(0)}%)</span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
