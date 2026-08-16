"use client"

import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { CaretDown, Check, DotsThree } from "../icons/index.js"
import { cn } from "../lib/cn.js"
import { POPOVER_SURFACE } from "../lib/overlay.js"
import { useViewportClamp } from "../lib/use-viewport-clamp.js"
import { Button, IconButton } from "../primitives/button.js"

export interface DropdownMenuItem {
  description?: ReactNode
  disabled?: boolean
  icon?: ReactNode
  label: ReactNode
  onSelect?: () => void
  tone?: "default" | "danger"
}

export interface DropdownMenuProps {
  /** Which edge of the trigger the menu hangs from. */
  align?: "start" | "end"
  items: DropdownMenuItem[]
  label?: string
  triggerLabel?: ReactNode
  triggerVariant?: "button" | "icon"
}

export function DropdownMenu({
  align = "end",
  items,
  label = "Open menu",
  triggerLabel = "Actions",
  triggerVariant = "button",
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { ref: menuRef, shift } = useViewportClamp<HTMLDivElement>(open)

  useEffect(() => {
    if (!open) {
      return
    }
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative inline-flex">
      {triggerVariant === "icon" ? (
        <IconButton
          aria-label={label}
          variant="ghost"
          size="sm"
          icon={<DotsThree size={18} aria-hidden="true" />}
          onClick={() => setOpen((current) => !current)}
        />
      ) : (
        <Button
          variant="secondary"
          size="sm"
          trailingIcon={<CaretDown size={16} aria-hidden="true" />}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {triggerLabel}
        </Button>
      )}
      {open ? (
        /* The shift rides on this wrapper, not on the menu itself:
         * POPOVER_SURFACE animates the menu in with `animate-rise`, and a
         * running animation beats an inline style on the same property. */
        <div
          style={shift === 0 ? undefined : { transform: `translateX(${shift}px)` }}
          className={cn(
            "absolute top-[calc(100%+0.5rem)] z-overlay",
            /* Which edge it hangs from is the caller's choice, because it
             * depends on where the trigger sits: right-aligned for a control at
             * the end of a row, left-aligned for one at the start. The clamp
             * then keeps that choice from running off the screen. */
            align === "end" ? "right-0" : "left-0",
          )}
        >
          <div
            ref={menuRef}
            role="menu"
            /* `max-w` as well as the shift: a menu wider than the screen cannot
             * be slid into view, only narrowed into it. */
            className={cn("min-w-56 max-w-[calc(100vw-1rem)]", POPOVER_SURFACE)}
          >
            {items.map((item) => (
              <button
                key={String(item.label)}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={cn(
                  "flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition duration-fast ease-standard",
                  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring",
                  item.tone === "danger" ? "text-danger hover:bg-danger-soft" : "text-fg hover:bg-primary-soft",
                  item.disabled && "cursor-not-allowed opacity-50",
                )}
                onClick={() => {
                  item.onSelect?.()
                  setOpen(false)
                }}
              >
                <span className="mt-0.5 text-fg-subtle">{item.icon ?? <Check size={16} aria-hidden="true" />}</span>
                <span className="space-y-0.5">
                  <span className="block text-sm font-medium">{item.label}</span>
                  {item.description ? <span className="block text-xs text-fg-muted">{item.description}</span> : null}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
