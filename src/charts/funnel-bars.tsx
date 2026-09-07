"use client"

import type { ReactNode } from "react"
import { EmptyState } from "../patterns/empty-state.js"
import { Skeleton } from "../primitives/skeleton.js"
import { cn } from "../lib/cn.js"
import { sequentialColor } from "./palette.js"

export interface FunnelBarEntry {
  count: number
  key: string
  label: string
}

export interface FunnelBarsProps {
  emptyDescription?: ReactNode
  emptyTitle?: ReactNode
  entries: FunnelBarEntry[]
  /**
   * Names the grid a screen reader lands in. The default describes a lead
   * pipeline because that is what this was built for; any consumer breaking
   * down something else — a trial funnel, a list of disqualification reasons —
   * has to say so, or its readers are told they are somewhere they are not.
   */
  label?: string
  loading?: boolean
  onSelect?: (key: string) => void
  /**
   * The denominator every count is a share of.
   *
   * Defaults to the sum of the counts, which is correct for a **disjoint**
   * breakdown — a pipeline by status, where every lead sits in exactly one row,
   * so the shares add up to 100% because the rows partition one population.
   *
   * It is wrong for a **funnel**, whose steps are nested subsets of the *same*
   * population: the top of a funnel is 100% of itself, not a fraction of the
   * steps below it, and its shares must not add up to 100% by construction
   * (review finding 111). A funnel passes its first step's count here, and says
   * on screen what the share is of.
   *
   * A count larger than the denominator still prints its real share — a step
   * over 100% is a fact the reader needs — but its bar stops at full width.
   */
  total?: number
}

export function FunnelBars({
  emptyDescription = "Leads will appear here once they start flowing in.",
  emptyTitle = "No pipeline data yet",
  entries,
  label = "Pipeline by status",
  loading = false,
  onSelect,
  total,
}: FunnelBarsProps) {
  if (loading) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    )
  }

  const summed = entries.reduce((sum, entry) => sum + entry.count, 0)

  if (entries.length === 0 || summed === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  /* A caller that passes a denominator owns it, including a zero one — which is
     a funnel whose first step is empty, and every share of nothing is nothing. */
  const denominator = total ?? summed
  const max = Math.max(...entries.map((entry) => entry.count), 1)

  return (
    <div className="space-y-2.5" role="table" aria-label={label}>
      {entries.map((entry) => {
        const share = denominator > 0 ? (entry.count / denominator) * 100 : 0
        const width = Math.min(100, share)
        const intensity = 0.35 + 0.65 * (entry.count / max)
        const Wrapper = onSelect ? "button" : "div"
        return (
          <Wrapper
            key={entry.key}
            type={onSelect ? "button" : undefined}
            onClick={onSelect ? () => onSelect(entry.key) : undefined}
            /* Label and count share a line above a full-width bar, rather than
             * flanking it. Side by side, the bar is what gives way as the
             * screen narrows — it was the first thing to reach zero width on a
             * phone, leaving a row of numbers with no chart in it. Stacked, the
             * reading stays put and the bar gets the whole width to work in.
             *
             * A grid, not nested flex rows, so all three stay direct children:
             * `role="row"` has to own its cells. */
            className={cn(
              "grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1.5 rounded-md px-1 py-1.5 text-left",
              onSelect &&
                "transition duration-fast ease-standard hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring",
            )}
            role="row"
          >
            <span className="min-w-0 truncate text-xs text-fg-muted" role="cell">
              {entry.label}
            </span>
            <span className="shrink-0 font-mono text-xs tabular-nums text-fg" role="cell">
              {entry.count} <span className="text-fg-subtle">({share.toFixed(0)}%)</span>
            </span>
            {/* The track carries the ring so an empty stage is still a visible
                row rather than a blank line. */}
            <span
              className="col-span-2 h-2.5 overflow-hidden rounded-full bg-surface-sunken ring-1 ring-inset ring-edge"
              role="cell"
            >
              <span
                className="block h-full rounded-full"
                style={{ width: `${width}%`, backgroundColor: sequentialColor, opacity: intensity }}
              />
            </span>
          </Wrapper>
        )
      })}
    </div>
  )
}
