"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import { cn } from "../lib/cn.js"
import { useViewportClamp } from "../lib/use-viewport-clamp.js"

export interface TooltipProps {
  children: ReactNode
  content: ReactNode
  side?: "top" | "bottom"
}

export function Tooltip({ children, content, side = "top" }: TooltipProps) {
  const [open, setOpen] = useState(false)
  const { ref: tooltipRef, shift } = useViewportClamp<HTMLSpanElement>(open)

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {/* Centring and the clamp live together on this wrapper, and the fade
       * lives on the tooltip inside it. They cannot share an element: both are
       * `transform`, so whichever is written second wins and the tooltip either
       * loses its centring or never moves. */}
      <span
        aria-hidden={!open}
        style={{ transform: `translateX(calc(-50% + ${shift}px))` }}
        className={cn(
          "pointer-events-none absolute left-1/2 z-overlay",
          side === "top" ? "bottom-[calc(100%+0.5rem)]" : "top-[calc(100%+0.5rem)]",
        )}
      >
        <span
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            /* The one floating element that does NOT use the raised surface: a
             * tooltip is an annotation on the thing under it, not a layer of
             * the app, and inverting it is what says so. */
            "block w-max max-w-[min(20rem,calc(100vw-1rem))] rounded-md bg-fg px-3 py-2 text-xs leading-snug text-background shadow-overlay transition duration-fast ease-standard",
            open ? "translate-y-0 opacity-100" : side === "top" ? "translate-y-1 opacity-0" : "-translate-y-1 opacity-0",
          )}
        >
          {content}
        </span>
      </span>
    </span>
  )
}
