import type { ReactNode } from "react"
import { cn } from "../lib/cn.js"
import { seamCorners } from "./seam-grid.js"

export interface DescriptionListItem {
  label: ReactNode
  value: ReactNode
}

export interface DescriptionListProps {
  items: DescriptionListItem[]
}

/* Facts about one thing, so it is a seam grid: the package rendered separate
 * rounded blocks with gaps between them, which reads as unrelated cards.
 *
 * It cannot BE a SeamGrid — a <dl> needs its own div-per-pair structure — so it
 * borrows the corner helper instead of re-deriving the rounding. */
export function DescriptionList({ items }: DescriptionListProps) {
  return (
    <dl className="m-0 grid gap-px rounded-xl bg-seam ring-1 ring-inset ring-edge sm:grid-cols-2">
      {items.map((item, index) => (
        <div
          key={String(item.label)}
          className={cn("bg-surface px-4 py-3", seamCorners(index, items.length, { base: 1, sm: 2 }))}
        >
          <dt className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-fg-subtle">
            {item.label}
          </dt>
          <dd className="mt-2 text-sm text-fg">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
