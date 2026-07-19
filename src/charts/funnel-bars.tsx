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
  loading?: boolean
  onSelect?: (key: string) => void
}

export function FunnelBars({
  emptyDescription = "Leads will appear here once they start flowing in.",
  emptyTitle = "No pipeline data yet",
  entries,
  loading = false,
  onSelect,
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

  const total = entries.reduce((sum, entry) => sum + entry.count, 0)

  if (entries.length === 0 || total === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  const max = Math.max(...entries.map((entry) => entry.count), 1)

  return (
    <div className="space-y-2.5" role="table" aria-label="Pipeline by status">
      {entries.map((entry) => {
        const pct = total > 0 ? (entry.count / total) * 100 : 0
        const intensity = 0.35 + 0.65 * (entry.count / max)
        const Wrapper = onSelect ? "button" : "div"
        return (
          <Wrapper
            key={entry.key}
            type={onSelect ? "button" : undefined}
            onClick={onSelect ? () => onSelect(entry.key) : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-md py-1 text-left",
              onSelect &&
                "transition duration-fast ease-standard hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring",
            )}
            role="row"
          >
            <span className="w-32 shrink-0 truncate text-right text-xs text-fg-muted" role="cell">
              {entry.label}
            </span>
            <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-sunken" role="cell">
              <span
                className="block h-full rounded-full"
                style={{ width: `${pct}%`, backgroundColor: sequentialColor, opacity: intensity }}
              />
            </span>
            <span className="w-20 shrink-0 font-mono text-xs tabular-nums text-fg" role="cell">
              {entry.count} <span className="text-fg-subtle">({pct.toFixed(0)}%)</span>
            </span>
          </Wrapper>
        )
      })}
    </div>
  )
}
