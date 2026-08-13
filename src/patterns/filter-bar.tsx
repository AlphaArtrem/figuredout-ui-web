import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "../lib/cn.js"

export interface FilterBarProps extends HTMLAttributes<HTMLDivElement> {
  actions?: ReactNode
}

/* A single ringed strip on `surface` holding the controls that scope the view
 * below it. Because fields are sunken now, the bar reads as a rail with holes
 * in it rather than as a card containing more cards. */
export function FilterBar({ actions, children, className, ...props }: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl bg-surface p-3 ring-1 ring-inset ring-edge md:flex-row md:items-center md:justify-between",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:items-center">{children}</div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}
