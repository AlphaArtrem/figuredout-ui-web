"use client"

import type { ReactNode } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts"
import { ChartTooltip } from "./chart-tooltip.js"
import { sequentialColor } from "./palette.js"

export interface SparklineProps {
  color?: string
  data: Array<{ label: string; value: number }>
  height?: number
  /**
   * What the tile says instead of a trend when there is not yet a trend to
   * draw. It is read, not decoration, so it stays out of the `aria-hidden`
   * wrapper the chart itself uses.
   */
  notEnoughDataLabel?: ReactNode
  valueFormatter?: (value: number) => string
}

/* 24 — a one-point series drew a single pale dot floating in 171 px of nothing.
 * That is recharts being reasonable: `dot={false}` suppresses the dots ON a line,
 * and a series of one point has no line, so the library falls back to rendering
 * the point itself. A lone dot is not a trend and reads as a rendering fault.
 *
 * Below two points there is nothing to draw, so it says so instead of drawing.
 * The chart is `aria-hidden` because the number it decorates is stated beside
 * it; this replacement is not, because it is the only thing on the tile saying
 * why the trend is missing. */
export function Sparkline({
  color = sequentialColor,
  data,
  height = 36,
  notEnoughDataLabel = "Not enough data yet",
  valueFormatter = (value) => String(value),
}: SparklineProps) {
  if (data.length < 2) {
    return (
      <span style={{ minHeight: height }} className="flex w-full items-center text-xs text-fg-subtle">
        {notEnoughDataLabel}
      </span>
    )
  }

  return (
    <div style={{ height }} className="w-full" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <Tooltip
            content={<ChartTooltip valueFormatter={(value) => valueFormatter(Number(value))} />}
            wrapperStyle={{ zIndex: 50 }}
          />
          <Line
            type="monotone"
            dataKey="value"
            name="Trend"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
