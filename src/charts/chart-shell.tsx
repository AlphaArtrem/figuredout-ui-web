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
  data: T[]
  emptyDescription?: ReactNode
  emptyTitle?: ReactNode
  height?: number
  loading?: boolean
  legend?: ChartSeries[]
  renderChart: () => ReactNode
  rowKey: (row: T) => string
  tableColumns: TableColumn<T>[]
}

export function ChartShell<T>({
  data,
  emptyDescription = "Data will appear here once activity starts flowing in.",
  emptyTitle = "No data yet",
  height = 260,
  loading = false,
  legend,
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

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        {legend && legend.length > 1 ? (
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
        ) : (
          <span />
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
      ) : (
        <div style={{ height }} className="w-full">
          {renderChart()}
        </div>
      )}
    </div>
  )
}
