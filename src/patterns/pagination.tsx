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
        Page <span className="font-medium text-fg">{currentPage}</span> of{" "}
        <span className="font-medium text-fg">{totalPages}</span>
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
        {getVisiblePages(currentPage, totalPages).map((page) => (
          <button
            key={page}
            type="button"
            aria-current={page === currentPage ? "page" : undefined}
            className={cn(
              "inline-flex h-9 min-w-9 items-center justify-center rounded-sm px-3 text-sm font-medium transition duration-fast ease-standard",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring active:scale-[0.98]",
              page === currentPage ? "bg-primary text-primary-fg shadow-raised" : "bg-surface-raised text-fg hover:bg-surface",
            )}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
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
