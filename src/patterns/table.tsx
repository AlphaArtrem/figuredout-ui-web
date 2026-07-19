"use client"

import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import { ArrowsLeftRight } from "../icons/index.js"
import { cn } from "../lib/cn.js"
import { EmptyState } from "./empty-state.js"

type SortDirection = "asc" | "desc"

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
  rowKey: (row: T) => string
  stickyHeader?: boolean
}

export function Table<T>({ columns, data, emptyState, rowKey, stickyHeader = true }: TableProps<T>) {
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
    <div className="overflow-hidden rounded-lg bg-surface p-1 shadow-raised ring-1 ring-inset ring-edge">
      <div className="overflow-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-surface-raised">
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  className={cn(
                    "border-b border-edge bg-surface-raised px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-fg-subtle",
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
            {sortedData.map((row) => (
              <tr
                key={rowKey(row)}
                className="transition duration-fast ease-standard hover:bg-surface-raised"
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      "border-b border-edge px-4 py-3 text-sm text-fg last:border-b-0",
                      column.align === "right" ? "text-right" : "text-left",
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
