"use client"

import type { ReactNode } from "react"
import { EmptyState } from "../patterns/empty-state.js"
import { Skeleton } from "../primitives/skeleton.js"
import { cn } from "../lib/cn.js"
import { toneColor } from "../lib/tone.js"
import type { Tone } from "../lib/tone.js"
import { sequentialColor } from "./palette.js"
import { clampShare } from "./resolve-color.js"

export interface RankedBarItem {
  /** Any CSS colour. Wins over `tone`; with neither, the bar takes `--chart-seq`. */
  color?: string
  key: string
  label: string
  /** A quiet note before the value — "12 leads", "+4 this week". */
  meta?: ReactNode
  /** For a bar that carries a status. Bars compare one measure, so most take no tone at all. */
  tone?: Tone
  value: number
}

export interface RankedBarsProps {
  emptyDescription?: ReactNode
  emptyTitle?: ReactNode
  /** Rendered in the order given — sort before passing. */
  items: RankedBarItem[]
  /** Names the list for a screen reader — "Leads by source". */
  label: string
  loading?: boolean
  /**
   * The value a full-width bar stands for. Defaults to the largest value, so
   * the leader fills the track. Pass a fixed scale (100 for scores) when bars on
   * different screens must be comparable. A value over `max` stops at full width.
   */
  max?: number
  /** Makes each row selectable. The whole row is the target; the label is the button's name. */
  onSelect?: (key: string) => void
  valueFormatter?: (value: number) => ReactNode
}

/**
 * Categories compared on one measure, as horizontal bars with the label and
 * value on a line above each bar. The default for "which is biggest". Parts of
 * one whole are a `StackedBar`; a trend is a `LineChart`.
 */
export function RankedBars({
  emptyDescription = "Values will appear here once there is something to compare.",
  emptyTitle = "Nothing to compare yet",
  items,
  label,
  loading = false,
  max,
  onSelect,
  valueFormatter = (value) => String(value),
}: RankedBarsProps) {
  if (loading) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  const scale = max ?? Math.max(0, ...items.map((item) => item.value))

  return (
    <div className="space-y-2.5" role="table" aria-label={label}>
      {items.map((item) => {
        const color = item.color ?? (item.tone ? toneColor(item.tone) : sequentialColor)
        return (
          <div
            key={item.key}
            role="row"
            /* Label and value share a line above a full-width bar, rather than
             * flanking it. Side by side, the bar is what gives way as the
             * screen narrows — it was the first thing to reach zero width on a
             * phone. A grid, not nested flex rows, so all three stay direct
             * children: `role="row"` has to own its cells. */
            className={cn(
              "relative grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1.5 rounded-md px-1 py-1.5 text-left",
              onSelect &&
                "transition duration-fast ease-standard hover:bg-surface-raised has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-focus-ring",
            )}
          >
            <span className="min-w-0 truncate text-xs text-fg-muted" role="cell">
              {onSelect ? (
                /* A button inside the row, stretched over it by its ::after, so
                 * the row keeps its table semantics (a <button role="row"> is
                 * not a button to assistive technology) while the whole row is
                 * still the click target. */
                <button
                  type="button"
                  onClick={() => onSelect(item.key)}
                  className="block w-full truncate text-left after:absolute after:inset-0 after:rounded-md after:content-[''] focus-visible:outline-none"
                >
                  {item.label}
                </button>
              ) : (
                item.label
              )}
            </span>
            <span className="shrink-0 font-mono text-xs tabular-nums text-fg" role="cell">
              {item.meta != null ? <span className="mr-2 font-sans text-fg-subtle">{item.meta}</span> : null}
              {valueFormatter(item.value)}
            </span>
            {/* The track carries the ring so an empty row is still a visible
                row rather than a blank line. */}
            <span
              className="col-span-2 h-2.5 overflow-hidden rounded-full bg-surface-sunken ring-1 ring-inset ring-edge"
              role="cell"
            >
              <span
                className="block h-full rounded-full transition-[width] duration-normal ease-standard motion-reduce:transition-none"
                style={{ width: `${clampShare(item.value, scale) * 100}%`, backgroundColor: color }}
              />
            </span>
          </div>
        )
      })}
    </div>
  )
}
