"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts"
import { ChartTooltip } from "./chart-tooltip.js"
import { sequentialColor } from "./palette.js"

export interface SparklineProps {
  color?: string
  data: Array<{ label: string; value: number }>
  height?: number
  valueFormatter?: (value: number) => string
}

export function Sparkline({
  color = sequentialColor,
  data,
  height = 36,
  valueFormatter = (value) => String(value),
}: SparklineProps) {
  if (data.length === 0) {
    return null
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
