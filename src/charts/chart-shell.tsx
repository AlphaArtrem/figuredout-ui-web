"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import { Table as TableIcon } from "../icons/index.js"
import { cn } from "../lib/cn.js"
import { Skeleton } from "../primitives/skeleton.js"
import { EmptyState } from "../patterns/empty-state.js"
import { Table } from "../patterns/table.js"
import type { TableColumn } from "../patterns/table.js"
import type { ChartSeries } from "./types.js"

export interface ChartShellProps<T> {
  /**
   * What the plotted values are measured in — "US dollars", "messages". A mono
   * caption above the plot's leading edge, which is where the value axis is, so
   * a reader knows `180` is not a count. Omitted, nothing is rendered.
   */
  caption?: ReactNode
  data: T[]
  emptyDescription?: ReactNode
  emptyTitle?: ReactNode
  height?: number
  loading?: boolean
  legend?: ChartSeries[]
  /**
   * When set, there is data but not enough of it to draw — one point is not a
   * line. The chart is replaced by this sentence; the legend, the caption and
   * "View as table" stay, so the value that does exist can still be read.
   */
  notEnoughData?: ReactNode
  renderChart: () => ReactNode
  rowKey: (row: T) => string
  tableColumns: TableColumn<T>[]
}

export function ChartShell<T>({
  caption,
  data,
  emptyDescription = "Data will appear here once activity starts flowing in.",
  emptyTitle = "No data yet",
  height = 260,
  loading = false,
  legend,
  notEnoughData,
  renderChart,
  rowKey,
  tableColumns,
}: ChartShellProps<T>) {
  const [showTable, setShowTable] = useState(false)

  if (loading) {
    return <Skeleton style={{ height }} className="w-full" />
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  const legendList =
    legend && legend.length > 1 ? (
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
        {legend.map((entry) => (
          <li key={entry.key} className="flex items-center gap-1.5 text-xs text-fg-muted">
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.label}
          </li>
        ))}
      </ul>
    ) : null

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        {caption != null ? (
          <div className="min-w-0 space-y-1.5">
            <p className="m-0 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-fg-subtle">
              {caption}
            </p>
            {legendList}
          </div>
        ) : (
          legendList ?? <span />
        )}
        <button
          type="button"
          onClick={() => setShowTable((current) => !current)}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-sm px-2 py-1 text-xs font-medium text-fg-muted transition duration-fast ease-standard hover:bg-surface-raised hover:text-fg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring",
          )}
          aria-pressed={showTable}
        >
          <TableIcon size={14} aria-hidden="true" />
          {showTable ? "View chart" : "View as table"}
        </button>
      </div>
      {showTable ? (
        <Table columns={tableColumns} data={data} rowKey={rowKey} stickyHeader={false} />
      ) : notEnoughData != null ? (
        /* `Sparkline`'s treatment, and for its reason: below two points recharts
         * falls back to drawing the lone point, and a single dot in an empty
         * plot reads as a rendering fault rather than as "one day so far". */
        <p className="m-0 py-2 text-xs text-fg-subtle">{notEnoughData}</p>
      ) : (
        <div style={{ height }} className="w-full">
          {renderChart()}
        </div>
      )}
    </div>
  )
}
