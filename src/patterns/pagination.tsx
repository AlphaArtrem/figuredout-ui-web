import { CaretLeft, CaretRight } from "../icons/index.js"
import { cn } from "../lib/cn.js"
import { Button } from "../primitives/button.js"

export interface PaginationProps {
  currentPage: number
  onPageChange: (page: number) => void
  totalPages: number
}

function getVisiblePages(currentPage: number, totalPages: number) {
  const start = Math.max(1, currentPage - 1)
  const end = Math.min(totalPages, currentPage + 1)
  const pages = []
  for (let page = start; page <= end; page += 1) {
    pages.push(page)
  }
  if (!pages.includes(1)) {
    pages.unshift(1)
  }
  if (!pages.includes(totalPages)) {
    pages.push(totalPages)
  }
  return [...new Set(pages)]
}

export function Pagination({ currentPage, onPageChange, totalPages }: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-fg-muted">
        Page <span className="font-mono font-medium tabular-nums text-fg">{currentPage}</span> of{" "}
        <span className="font-mono font-medium tabular-nums text-fg">{totalPages}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage === 1}
          leadingIcon={<CaretLeft size={14} aria-hidden="true" />}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>
        {/* The same sunken track as Tabs, with the current page raised out of
         * it: one segmented-control idiom, so a reader who has learned one has
         * learned the other. */}
        <div className="flex items-center gap-1 rounded-lg bg-surface-sunken p-1 ring-1 ring-inset ring-edge">
          {getVisiblePages(currentPage, totalPages).map((page) => (
            <button
              key={page}
              type="button"
              aria-current={page === currentPage ? "page" : undefined}
              className={cn(
                "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 font-mono text-sm tabular-nums transition duration-fast ease-standard",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring active:scale-[0.98]",
                page === currentPage ? "bg-primary font-semibold text-primary-fg" : "text-fg-muted hover:text-fg",
              )}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage === totalPages}
          trailingIcon={<CaretRight size={14} aria-hidden="true" />}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
