"use client"

import { useId, useState } from "react"
import type { HTMLAttributes, ReactNode } from "react"
import { Minus, Plus } from "../icons/index.js"
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

/* An open tile is an overlay that stayed where it was.
 *
 * The package kept the same surface when a tile opened, so a page of open tiles
 * flattened into one wall of text. The open state now takes the elevation the
 * system already reserves for things that cover other things —
 * --shadow-overlay, the Dialog and SidePanel step — plus the raised surface,
 * the strong ring and a 3px lift. No new token: an open tile IS an overlay in
 * everything but position.
 *
 * The marker is +/− rather than a rotating caret. A caret says "there is more
 * below"; the sign says "this opens and closes", which is what an optional
 * detail block does. */
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
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        "rounded-lg bg-surface ring-1 ring-inset ring-edge transition duration-normal ease-standard",
        "hover:-translate-y-0.5 hover:shadow-hover hover:ring-edge-strong",
        isOpen && "relative z-[1] -translate-y-[3px] bg-surface-raised shadow-overlay ring-edge-strong",
        "motion-reduce:transform-none",
        className,
      )}
      {...props}
    >
      <button
        type="button"
        className="flex w-full items-start justify-between gap-4 rounded-lg px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring"
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
        <span
          aria-hidden="true"
          className="inline-grid size-6 shrink-0 place-items-center rounded-sm bg-primary-soft text-primary transition duration-fast ease-standard"
        >
          {isOpen ? <Minus size={14} /> : <Plus size={14} />}
        </span>
      </button>
      <div
        id={contentId}
        hidden={!isOpen}
        className="border-t border-edge px-5 pb-5 pt-4 text-sm text-fg-muted motion-safe:animate-rise"
      >
        {children}
      </div>
    </div>
  )
}
