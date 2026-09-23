"use client"

import type { ReactNode } from "react"
import { EmptyState } from "../patterns/empty-state.js"
import { sequentialColor } from "./palette.js"
import { RankedBars } from "./ranked-bars.js"

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

/* `RankedBars` with a share-of-a-denominator reading: every bar is its count's
 * share of `total`, the value prints the count and that share, and the fill's
 * strength carries magnitude. The layout, the selectable row and the track are
 * RankedBars', so the two cannot drift apart. */
export function FunnelBars({
  emptyDescription = "Leads will appear here once they start flowing in.",
  emptyTitle = "No pipeline data yet",
  entries,
  label = "Pipeline by status",
  loading = false,
  onSelect,
  total,
}: FunnelBarsProps) {
  const summed = entries.reduce((sum, entry) => sum + entry.count, 0)

  if (!loading && (entries.length === 0 || summed === 0)) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  /* A caller that passes a denominator owns it, including a zero one — which is
     a funnel whose first step is empty, and every share of nothing is nothing. */
  const denominator = total ?? summed
  const largest = Math.max(...entries.map((entry) => entry.count), 1)

  return (
    <RankedBars
      label={label}
      loading={loading}
      max={denominator}
      {...(onSelect ? { onSelect } : {})}
      items={entries.map((entry) => {
        /* 35% to 100% of the sequential hue, by the count's size against the largest. */
        const strength = Math.round((0.35 + 0.65 * (entry.count / largest)) * 100)
        return {
          key: entry.key,
          label: entry.label,
          value: entry.count,
          color: `color-mix(in srgb, ${sequentialColor} ${strength}%, transparent)`,
        }
      })}
      valueFormatter={(count) => {
        const share = denominator > 0 ? (count / denominator) * 100 : 0
        return (
          <>
            {count} <span className="text-fg-subtle">({share.toFixed(0)}%)</span>
          </>
        )
      }}
    />
  )
}
