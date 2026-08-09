"use client"

import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import { ArrowsLeftRight } from "../icons/index.js"
import { cn } from "../lib/cn.js"
import { EmptyState } from "./empty-state.js"

type SortDirection = "asc" | "desc"
export type TableRowTone = "neutral" | "info" | "warning" | "danger" | "success"

export interface TableColumn<T> {
  header: ReactNode
  id: string
  render: (row: T) => ReactNode
  sortValue?: (row: T) => string | number
  align?: "left" | "right"
}

export interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  emptyState?: ReactNode
  rowTone?: (row: T) => TableRowTone | undefined
  rowKey: (row: T) => string
  stickyHeader?: boolean
  variant?: "framed" | "plain"
}

const ROW_TONE_STYLES: Record<TableRowTone, string> = {
  neutral: "",
  info: "bg-info-soft/40",
  warning: "bg-warning-soft/50",
  danger: "bg-danger-soft/50",
  success: "bg-success-soft/40",
}

const FIRST_CELL_TONE_STYLES: Record<TableRowTone, string> = {
  neutral: "",
  info: "shadow-[inset_3px_0_0_var(--color-info)]",
  warning: "shadow-[inset_3px_0_0_var(--color-warning)]",
  danger: "shadow-[inset_3px_0_0_var(--color-danger)]",
  success: "shadow-[inset_3px_0_0_var(--color-success)]",
}

export function Table<T>({
  columns,
  data,
  emptyState,
  rowKey,
  rowTone,
  stickyHeader = true,
  variant = "framed",
}: TableProps<T>) {
  const sortableColumns = columns.filter((column) => column.sortValue)
  const [sortState, setSortState] = useState<{
    columnId: string
    direction: SortDirection
  } | null>(
    sortableColumns[0]
      ? {
          columnId: sortableColumns[0].id,
          direction: "asc",
        }
      : null,
  )

  const sortedData = useMemo(() => {
    if (!sortState) {
      return data
    }
    const activeColumn = columns.find((column) => column.id === sortState.columnId)
    const getSortValue = activeColumn?.sortValue
    if (!activeColumn || !getSortValue) {
      return data
    }
    return [...data].sort((left, right) => {
      const leftValue = getSortValue(left)
      const rightValue = getSortValue(right)
      if (leftValue === rightValue) {
        return 0
      }
      const result = leftValue < rightValue ? -1 : 1
      return sortState.direction === "asc" ? result : result * -1
    })
  }, [columns, data, sortState])

  if (data.length === 0) {
    return (
      <>
        {emptyState ?? (
          <EmptyState
            title="No records yet"
            description="This table is ready for results once filters return matches."
          />
        )}
      </>
    )
  }

  return (
    <div
      className={cn(
        "overflow-x-auto",
        variant === "framed" && "overflow-hidden rounded-lg bg-surface p-1 shadow-raised ring-1 ring-inset ring-edge",
        variant === "plain" && "rounded-md",
      )}
    >
      <div className="overflow-auto">
        <table className={cn("min-w-full", variant === "framed" ? "border-separate border-spacing-0" : "border-collapse")}>
          <thead>
            <tr className={cn(variant === "framed" && "bg-surface-raised")}>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(
                    "border-b px-4 py-3 text-xs font-semibold uppercase text-fg-subtle",
                    variant === "framed" && "border-edge bg-surface-raised tracking-[0.12em]",
                    variant === "plain" && "border-edge-strong bg-background font-mono tracking-[0.1em]",
                    stickyHeader && "sticky top-0 z-[1]",
                    column.align === "right" ? "text-right" : "text-left",
                  )}
                >
                  {column.sortValue ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-sm transition duration-fast ease-standard hover:text-fg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring"
                      onClick={() =>
                        setSortState((current) => {
                          if (!current || current.columnId !== column.id) {
                            return { columnId: column.id, direction: "asc" }
                          }
                          return {
                            columnId: column.id,
                            direction: current.direction === "asc" ? "desc" : "asc",
                          }
                        })
                      }
                    >
                      {column.header}
                      <ArrowsLeftRight size={12} aria-hidden="true" />
                    </button>
                  ) : (
                    <span>{column.header}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => {
              const tone = rowTone?.(row) ?? "neutral"

              return (
                <tr
                  key={rowKey(row)}
                  data-row-tone={tone === "neutral" ? undefined : tone}
                  className={cn(
                    "transition duration-fast ease-standard hover:bg-surface-raised",
                    ROW_TONE_STYLES[tone],
                  )}
                >
                  {columns.map((column, columnIndex) => (
                  <td
                    key={column.id}
                    className={cn(
                      "border-b border-edge px-4 py-3 text-sm text-fg",
                      variant === "plain" && "align-top",
                      columnIndex === 0 && FIRST_CELL_TONE_STYLES[tone],
                      column.align === "right" ? "text-right" : "text-left",
                    )}
                  >
                    {column.render(row)}
                  </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
