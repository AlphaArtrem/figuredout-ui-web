"use client"

import { cn } from "../lib/cn.js"
import type { Tone } from "../lib/tone.js"
import { Legend } from "./legend.js"
import { resolveColor } from "./resolve-color.js"

export interface StackedBarSegment {
  /** Any CSS colour — normally a `--chart-*` token. Wins over `tone`. */
  color?: string
  key: string
  label: string
  /** For segments that ARE statuses (passed, at risk, failed). Otherwise leave both unset for the categorical palette. */
  tone?: Tone
  value: number
}

export interface StackedBarProps {
  className?: string
  /** Names the whole bar for a screen reader — "Leads by outcome". */
  label: string
  /** Shows the legend under the bar. Without it the values are still in the page, visually hidden. */
  legend?: boolean
  legendLayout?: "inline" | "stacked"
  /** Makes each legend entry a button, and each segment clickable. The legend is the keyboard path. */
  onSelect?: (key: string) => void
  segments: StackedBarSegment[]
  /** Adds each segment's share of the whole to the legend. Defaults to true. */
  showPercent?: boolean
  size?: "sm" | "md"
  valueFormatter?: (value: number) => string
}

const BAR_HEIGHT = { sm: "h-2", md: "h-3.5" } as const

/**
 * One whole split into its parts, as a single 100% bar with a legend — the
 * default for "how is this total made up". Parts are in the order given.
 * Comparing categories that are not parts of one whole is `RankedBars`.
 */
export function StackedBar({
  className,
  label,
  legend = true,
  legendLayout = "inline",
  onSelect,
  segments,
  showPercent = true,
  size = "md",
  valueFormatter = (value) => String(value),
}: StackedBarProps) {
  const total = segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0)
  const resolved = segments.map((segment, index) => ({
    ...segment,
    color: resolveColor(segment, index),
    percent: total > 0 ? Math.round((Math.max(0, segment.value) / total) * 100) : 0,
  }))

  return (
    <div role="group" aria-label={label} className={cn("flex min-w-0 flex-col gap-3", className)}>
      {/* The bar is a picture of the legend's numbers, so it is hidden from
          assistive technology: the numbers themselves are always in the page. */}
      <div aria-hidden="true" className={cn("flex w-full min-w-0 gap-[3px]", BAR_HEIGHT[size])}>
        {total > 0 ? (
          resolved
            .filter((segment) => segment.value > 0)
            .map((segment) => (
              <span
                key={segment.key}
                title={`${segment.label}: ${valueFormatter(segment.value)}`}
                onClick={onSelect ? () => onSelect(segment.key) : undefined}
                className={cn(
                  "block min-w-[3px] rounded-[0.25rem]",
                  onSelect && "cursor-pointer transition-opacity duration-fast ease-standard hover:opacity-80",
                )}
                style={{ flex: `${segment.value / total} 1 0%`, backgroundColor: segment.color }}
              />
            ))
        ) : (
          <span className="block flex-1 rounded-[0.25rem] bg-chart-track" />
        )}
      </div>
      {legend ? (
        <Legend
          layout={legendLayout}
          {...(onSelect ? { onSelect } : {})}
          items={resolved.map((segment) => ({
            key: segment.key,
            label: segment.label,
            color: segment.color,
            value: (
              <>
                {valueFormatter(segment.value)}
                {showPercent ? (
                  <span className="ml-1 font-normal text-fg-subtle">{segment.percent}%</span>
                ) : null}
              </>
            ),
          }))}
        />
      ) : (
        <ul className="sr-only">
          {resolved.map((segment) => (
            <li key={segment.key}>
              {segment.label}: {valueFormatter(segment.value)}
              {showPercent ? ` (${segment.percent}%)` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
