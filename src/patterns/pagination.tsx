"use client"

import { useEffect, useState } from "react"
import { CaretLeft, CaretRight } from "../icons/index.js"
import { cn } from "../lib/cn.js"
import { Button, IconButton } from "../primitives/button.js"

export interface PaginationProps {
  currentPage: number
  onPageChange: (page: number) => void
  totalPages: number
}

/* Geometry of the track, in px, so the component can work out how many page
 * buttons the current width will take. These mirror the classes below — a page
 * button is `min-w-9` in a `gap-1` track with `p-1`, inside a `gap-2` group —
 * and the two have to move together. */
const PAGE_BUTTON = 36
const PAGE_GAP = 4
const TRACK_PADDING = 4
const GROUP_GAP = 8

/* Under this, the row drops to arrows alone. Measured on the component, not the
 * viewport: this is about the width Pagination was actually given, and it can be
 * handed a narrow column on a wide screen. */
const COMPACT_WIDTH = 480

/* Until the first measurement lands. Narrow, and compact, so the first paint can
 * only ever be smaller than what the measurement settles on — growing into the
 * space is far less noticeable than a row that overflows and snaps back. */
const INITIAL_LAYOUT = { slots: 3, compact: true }

/* The pages worth showing when only `slots` of them fit.
 *
 * First and last are the anchors — the last one doubles as the total — and the
 * rest of the budget grows outwards from the current page. */
function getVisiblePages(currentPage: number, totalPages: number, slots: number) {
  const budget = Math.max(1, Math.min(slots, totalPages))
  const pages = new Set([currentPage])

  if (budget >= 2) {
    pages.add(totalPages)
  }
  if (budget >= 3) {
    pages.add(1)
  }

  /* Widen a window around the current page until the budget is spent. Both ends
   * stop at the edges of the range, and by then every page is already in the
   * set, so this always terminates. */
  let low = currentPage
  let high = currentPage
  while (pages.size < budget && (low > 1 || high < totalPages)) {
    if (high < totalPages) {
      high += 1
      pages.add(high)
    }
    if (pages.size < budget && low > 1) {
      low -= 1
      pages.add(low)
    }
  }

  return [...pages].sort((a, b) => a - b)
}

/* How wide the row is, and how many page buttons fit in what the arrows leave.
 *
 * There is no CSS for "as many as fit" and the answer has to be a count before
 * anything can render, so the row measures itself. Two rules keep that honest:
 *
 *  - Measure inside the group, which is `flex-1 basis-0 min-w-0` and so is sized
 *    by what is left over, never by what it contains. Measuring a box the pages
 *    can stretch would feed the count back into its own input — the count grows,
 *    the box grows, and the row overflows its container.
 *
 *  - Subtract the arrows by measuring them, not by assuming a width. Their width
 *    depends on their text and on whether the row is compact, and unlike the
 *    track it does not depend on the count being produced here. */
function useFittingLayout(row: HTMLElement | null) {
  const [layout, setLayout] = useState(INITIAL_LAYOUT)

  useEffect(() => {
    const group = row?.querySelector("[data-pagination-group]")
    if (!row || !group || typeof ResizeObserver === "undefined") {
      return
    }

    const measure = () => {
      let available = group.clientWidth - TRACK_PADDING * 2 - (group.children.length - 1) * GROUP_GAP
      for (const child of group.children) {
        if (!child.hasAttribute("data-pagination-track")) {
          available -= child.getBoundingClientRect().width
        }
      }

      const next = {
        slots: Math.max(1, Math.floor((available + PAGE_GAP) / (PAGE_BUTTON + PAGE_GAP))),
        compact: row.clientWidth < COMPACT_WIDTH,
      }
      setLayout((previous) =>
        previous.slots === next.slots && previous.compact === next.compact ? previous : next,
      )
    }

    measure()
    /* The group for the count, the row for the mode: the label appearing changes
     * the first without the second, and a container resize changes both. */
    const observer = new ResizeObserver(measure)
    observer.observe(row)
    observer.observe(group)
    return () => observer.disconnect()
  }, [row])

  return layout
}

export function Pagination({ currentPage, onPageChange, totalPages }: PaginationProps) {
  const [row, setRow] = useState<HTMLElement | null>(null)
  const { compact, slots } = useFittingLayout(row)

  if (totalPages <= 1) {
    return null
  }

  const atStart = currentPage === 1
  const atEnd = currentPage === totalPages

  return (
    /* One line, always. The page buttons are what gives way when the width
     * does — a control that reflows onto a second row costs more vertical space
     * on a phone than the pages it was trying to keep. */
    <nav ref={setRow} aria-label="Pagination" className="flex min-w-0 items-center gap-2">
      {/* The label is what the width buys first: on a phone the last number in
       * the track already carries the total, and these words do not. */}
      {compact ? null : (
        <p className="shrink-0 text-sm text-fg-muted">
          Page <span className="font-mono font-medium tabular-nums text-fg">{currentPage}</span> of{" "}
          <span className="font-mono font-medium tabular-nums text-fg">{totalPages}</span>
        </p>
      )}

      {/* `basis-0 min-w-0` is load-bearing, and not only for the measurement
       * above: without it the group's intrinsic width is every page button at
       * full size, and a `grid` or `flex` parent that sizes to its content grows
       * to fit that — which is how the row ends up wider than the phone. */}
      <div
        data-pagination-group=""
        className={cn(
          "flex min-w-0 flex-1 basis-0 items-center gap-2",
          compact ? "justify-center" : "justify-end",
        )}
      >
        {compact ? (
          <IconButton
            variant="secondary"
            size="sm"
            aria-label="Previous page"
            disabled={atStart}
            icon={<CaretLeft size={14} aria-hidden="true" />}
            onClick={() => onPageChange(currentPage - 1)}
          />
        ) : (
          <Button
            variant="secondary"
            size="sm"
            disabled={atStart}
            leadingIcon={<CaretLeft size={14} aria-hidden="true" />}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </Button>
        )}

        {/* The same sunken track as Tabs, with the current page raised out of
         * it: one segmented-control idiom, so a reader who has learned one has
         * learned the other. It is sized by the pages it holds — a track wider
         * than its contents is just a long empty bar on a desktop, where the
         * page count is the limit rather than the space. */}
        <div
          data-pagination-track=""
          className="flex items-center gap-1 rounded-lg bg-surface-sunken p-1 ring-1 ring-inset ring-edge"
        >
          {getVisiblePages(currentPage, totalPages, slots).map((page) => (
            <button
              key={page}
              type="button"
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
              className={cn(
                "inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-md px-2 font-mono text-sm tabular-nums transition duration-fast ease-standard",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring active:scale-[0.98]",
                page === currentPage ? "bg-primary font-semibold text-primary-fg" : "text-fg-muted hover:text-fg",
              )}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>

        {compact ? (
          <IconButton
            variant="secondary"
            size="sm"
            aria-label="Next page"
            disabled={atEnd}
            icon={<CaretRight size={14} aria-hidden="true" />}
            onClick={() => onPageChange(currentPage + 1)}
          />
        ) : (
          <Button
            variant="secondary"
            size="sm"
            disabled={atEnd}
            trailingIcon={<CaretRight size={14} aria-hidden="true" />}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </Button>
        )}
      </div>
    </nav>
  )
}
