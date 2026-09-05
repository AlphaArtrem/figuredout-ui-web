"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import type { ReactNode, RefObject } from "react"
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
  /**
   * Wraps the table in its own surface. Only when the table IS the component —
   * inside a Card, a Section or a TableSection the container already provides
   * the frame, and two frames read as a box in a box.
   */
  framed?: boolean
  /**
   * Names the table and the horizontal scroll region around it. Pass the
   * heading the table already sits under — "Editors", "Plans", "Audit trail" —
   * never the word "table", which is the role and not the name.
   *
   * Without it a table that is wider than its box is unreachable by keyboard:
   * see the comment on the scroller below.
   */
  label?: string
  rowTone?: (row: T) => TableRowTone | undefined
  rowKey: (row: T) => string
  stickyHeader?: boolean
}

/* One table, not two variants. The package used to switch the header type and
 * the surface between `framed` and `plain`, so the same data looked like two
 * different components depending on where it landed. The table is now constant
 * and only its FRAME is optional.
 *
 * Row tone is a bar on the leading cell plus the faintest wash. The bar is
 * drawn from the tone directly rather than from `currentColor`: tinting the
 * cell's text to feed the shadow also tinted the row's most important label,
 * which is both a contrast loss and a claim that the text means something
 * different from the text beside it. */
const ROW_TONE_STYLES: Record<TableRowTone, string> = {
  neutral: "",
  info: "bg-[color-mix(in_srgb,var(--color-info-soft)_55%,transparent)]",
  warning: "bg-[color-mix(in_srgb,var(--color-warning-soft)_55%,transparent)]",
  danger: "bg-[color-mix(in_srgb,var(--color-danger-soft)_55%,transparent)]",
  success: "bg-[color-mix(in_srgb,var(--color-success-soft)_55%,transparent)]",
}

const FIRST_CELL_TONE_STYLES: Record<TableRowTone, string> = {
  neutral: "",
  info: "shadow-[inset_3px_0_0_var(--color-info)]",
  warning: "shadow-[inset_3px_0_0_var(--color-warning)]",
  danger: "shadow-[inset_3px_0_0_var(--color-danger)]",
  success: "shadow-[inset_3px_0_0_var(--color-success)]",
}

/* 122 — the scroll container had no `tabindex`, no `role` and no name, so the
 * columns that had scrolled off its right edge were reachable with a mouse, a
 * trackpad and a touch screen and by nothing else. A scroller is only keyboard
 * operable once something inside it can hold focus; arrow keys scroll the
 * focused element.
 *
 * It is made focusable ONLY while the content actually overflows. A permanently
 * focusable wrapper around a table that fits is a tab stop that does nothing and
 * a landmark naming a box nobody can scroll — the same defect pointed the other
 * way. One ResizeObserver watching the scroller and the table inside it is what
 * decides, so the answer follows a window resize, a column change and a data
 * change without polling and without a render loop.
 *
 * Where `ResizeObserver` is absent (SSR, and jsdom under test) the single mount
 * measurement stands; on the server both sizes are 0 and the first client
 * effect corrects it. */
function useHorizontalOverflow(ref: RefObject<HTMLElement>): boolean {
  const [overflowing, setOverflowing] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) {
      return
    }
    // A sub-pixel difference is a rounding artefact, not a hidden column.
    const measure = () => setOverflowing(node.scrollWidth - node.clientWidth > 1)
    measure()

    if (typeof ResizeObserver === "undefined") {
      return
    }
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    const table = node.firstElementChild
    if (table) {
      observer.observe(table)
    }
    return () => observer.disconnect()
  }, [ref])

  return overflowing
}

export function Table<T>({
  columns,
  data,
  emptyState,
  framed = false,
  label,
  rowKey,
  rowTone,
  stickyHeader = true,
}: TableProps<T>) {
  const captionId = useId()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const scrollable = useHorizontalOverflow(scrollerRef)
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

  const lastIndex = sortedData.length - 1

  return (
    <div
      className={cn(
        "relative min-w-0",
        framed &&
          /* The hairline is an overlay because the sticky header paints its own
           * full-bleed surface over an inset ring. */
          "rounded-xl bg-surface shadow-raised after:pointer-events-none after:absolute after:inset-0 after:z-[2] after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-edge after:content-['']",
      )}
    >
      {/* The scroller clips to a square box of its own, which cut the frame's
       * rounded corners off and let the last row's tone bar run square into
       * them. Inheriting the radius makes the clip follow the frame. */}
      <div
        ref={scrollerRef}
        className={cn(
          "overflow-x-auto",
          framed && "rounded-[inherit]",
          scrollable && label && "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring",
        )}
        {...(scrollable && label
          ? { role: "region", "aria-labelledby": captionId, tabIndex: 0 }
          : {})}
      >
        <table className="min-w-full border-collapse text-sm">
          {/* The caption names the table itself, and the scroll region borrows
              it by id rather than repeating the string. */}
          {label ? (
            <caption id={captionId} className="sr-only">
              {label}
            </caption>
          ) : null}
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  scope="col"
                  aria-sort={
                    sortState?.columnId === column.id
                      ? sortState.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                  className={cn(
                    "whitespace-nowrap border-b border-edge-strong bg-surface-raised px-4 py-3",
                    /* 76 — the header row ran two conventions at once: `uppercase` here and,
                     * for a sortable column, sentence case, because Tailwind's preflight
                     * resets `text-transform` on a <button> and the sortable header IS a
                     * button. Nothing about being sortable is worth shouting, and half
                     * these labels are tenant-authored field names, so sentence case is
                     * the one convention — `normal-case` explicitly, so it survives an
                     * `uppercase` inherited from whatever the table lands in. */
                    "font-mono text-[0.6875rem] font-semibold normal-case tracking-[0.1em] text-fg-subtle",
                    stickyHeader && "sticky top-0 z-[1]",
                    column.align === "right" ? "text-right" : "text-left",
                  )}
                >
                  {column.sortValue ? (
                    <button
                      type="button"
                      className={cn(
                        "inline-flex items-center gap-2 rounded-sm transition duration-fast ease-standard hover:text-fg",
                        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring",
                        sortState?.columnId === column.id && "text-primary",
                      )}
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
            {sortedData.map((row, rowIndex) => {
              const tone = rowTone?.(row) ?? "neutral"
              const isLast = rowIndex === lastIndex

              return (
                <tr
                  key={rowKey(row)}
                  data-row-tone={tone === "neutral" ? undefined : tone}
                  className={cn("transition duration-fast ease-standard hover:bg-surface-raised", ROW_TONE_STYLES[tone])}
                >
                  {columns.map((column, columnIndex) => (
                    <td
                      key={column.id}
                      className={cn(
                        "border-b border-edge px-4 py-3 align-top text-sm text-fg",
                        isLast && "border-b-0",
                        columnIndex === 0 && FIRST_CELL_TONE_STYLES[tone],
                        /* The corner cell carries the frame's radius so its tone
                         * bar — an inset shadow, which follows border-radius —
                         * curves with the frame instead of poking through it. */
                        framed && isLast && columnIndex === 0 && "rounded-bl-xl",
                        framed && isLast && columnIndex === columns.length - 1 && "rounded-br-xl",
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
