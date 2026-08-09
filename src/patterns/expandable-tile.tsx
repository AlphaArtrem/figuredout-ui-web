"use client"

import { useId, useState } from "react"
import type { HTMLAttributes, ReactNode } from "react"
import { CaretDown } from "../icons/index.js"
import { cn } from "../lib/cn.js"

export interface ExpandableTileProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  children?: ReactNode
  defaultOpen?: boolean
  description?: ReactNode
  icon?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title: ReactNode
}

export function ExpandableTile({
  children,
  className,
  defaultOpen = false,
  description,
  icon,
  onOpenChange,
  open,
  title,
  ...props
}: ExpandableTileProps) {
  const contentId = useId()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const isOpen = open ?? uncontrolledOpen

  const setOpen = (nextOpen: boolean) => {
    if (open === undefined) {
      setUncontrolledOpen(nextOpen)
    }
    onOpenChange?.(nextOpen)
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-edge bg-surface transition duration-normal ease-standard hover:border-edge-strong hover:shadow-hover",
        className,
      )}
      {...props}
    >
      <button
        type="button"
        className="flex w-full items-start justify-between gap-4 rounded-lg px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setOpen(!isOpen)}
      >
        <span className="flex min-w-0 items-start gap-3">
          {icon ? <span className="mt-0.5 shrink-0 text-fg-subtle">{icon}</span> : null}
          <span className="grid min-w-0 gap-1">
            <span className="text-sm font-semibold text-fg">{title}</span>
            {description ? <span className="text-sm text-fg-muted">{description}</span> : null}
          </span>
        </span>
        <CaretDown
          size={16}
          aria-hidden="true"
          className={cn("mt-1 shrink-0 text-fg-subtle transition duration-fast ease-standard", isOpen && "rotate-180")}
        />
      </button>
      <div id={contentId} hidden={!isOpen} className="border-t border-edge px-4 py-3 text-sm text-fg-muted">
        {children}
      </div>
    </div>
  )
}
