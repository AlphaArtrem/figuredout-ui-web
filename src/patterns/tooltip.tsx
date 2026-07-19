"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import { cn } from "../lib/cn.js"

export interface TooltipProps {
  children: ReactNode
  content: ReactNode
  side?: "top" | "bottom"
}

export function Tooltip({ children, content, side = "top" }: TooltipProps) {
  const [open, setOpen] = useState(false)

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-10 w-max max-w-xs -translate-x-1/2 rounded-sm bg-fg px-3 py-2 text-xs text-background shadow-overlay transition duration-fast ease-standard",
          side === "top" ? "bottom-[calc(100%+0.5rem)]" : "top-[calc(100%+0.5rem)]",
          open ? "translate-y-0 opacity-100" : side === "top" ? "translate-y-1 opacity-0" : "-translate-y-1 opacity-0",
        )}
      >
        {content}
      </span>
    </span>
  )
}
