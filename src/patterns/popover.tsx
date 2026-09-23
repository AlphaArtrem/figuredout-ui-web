"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import type { MutableRefObject, ReactNode } from "react"
import { cn } from "../lib/cn.js"
import { POPOVER_SURFACE } from "../lib/overlay.js"
import { useViewportClamp } from "../lib/use-viewport-clamp.js"

export interface PopoverTriggerProps {
  "aria-controls": string | undefined
  "aria-expanded": boolean
  "aria-haspopup": "dialog"
  onClick: () => void
  ref: MutableRefObject<HTMLButtonElement | null>
}

export interface PopoverProps {
  /** Which edge of the trigger the panel hangs from. `end` by default — the usual place for a top-bar control. */
  align?: "start" | "end"
  children: ReactNode
  /** Classes for the panel — a width, mostly. `w-[min(25rem,calc(100vw-1rem))]` by default. */
  className?: string
  defaultOpen?: boolean
  /** The panel's accessible name — "Notifications". */
  label: string
  onOpenChange?: (open: boolean) => void
  open?: boolean
  /**
   * Draws the trigger. Spread the props onto a button (an `IconButton` takes them
   * as they are): they carry the ref, the click and the expanded state.
   */
  trigger: (props: PopoverTriggerProps) => ReactNode
}

/*
 * A panel of arbitrary content anchored to a trigger — a notification list, a
 * short form, a filter set. `DropdownMenu` is the answer when the content is a
 * list of commands; it cannot hold anything else, which is why this exists.
 *
 * Non-modal: a `role="dialog"` without `aria-modal`, the page behind it stays
 * live, and nothing traps Tab. Opening moves focus to the panel, so a keyboard
 * user lands in what they opened and reads it from the top. It closes on
 * Escape — giving focus back to the trigger — on a pointer press outside, and
 * when focus leaves it for somewhere else on the page.
 *
 * Positioned like `DropdownMenu`: absolutely under the trigger, slid back inside
 * the viewport by `useViewportClamp` (applied to a wrapper, because the panel
 * animates its own transform).
 */
export function Popover({
  align = "end",
  children,
  className,
  defaultOpen = false,
  label,
  onOpenChange,
  open: controlledOpen,
  trigger,
}: PopoverProps) {
  const panelId = useId()
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const open = controlledOpen ?? internalOpen
  const containerRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const { ref: panelRef, shift } = useViewportClamp<HTMLDivElement>(open)

  /* The caller's callback is read through a ref, so an inline `onOpenChange`
   * does not re-run the effects below on every render — which would pull focus
   * back to the first control each time the parent re-rendered. */
  const onOpenChangeRef = useRef(onOpenChange)
  onOpenChangeRef.current = onOpenChange
  const isControlled = controlledOpen !== undefined
  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next)
      }
      onOpenChangeRef.current?.(next)
    },
    [isControlled],
  )

  /* Land on the panel itself, not its first control: in a notification list the
   * first control is "Mark all read", and a reflexive Enter should not fire it.
   * The reader starts at the top and tabs into what they want. */
  useEffect(() => {
    if (open) {
      panelRef.current?.focus()
    }
  }, [open, panelRef])

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
        event.preventDefault()
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    /* Focus leaving for somewhere else on the page — Tab past the last control,
     * a click into another field — closes it: an open panel nobody is in is
     * just in the way. `relatedTarget` is null when focus leaves the window,
     * which is not the user moving on, so that is ignored. */
    const handleFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget as Node | null
      if (next && !containerRef.current?.contains(next)) {
        setOpen(false)
      }
    }
    const container = containerRef.current
    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    container?.addEventListener("focusout", handleFocusOut)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
      container?.removeEventListener("focusout", handleFocusOut)
    }
  }, [open, setOpen])

  return (
    <div ref={containerRef} className="relative inline-flex">
      {trigger({
        "aria-controls": open ? panelId : undefined,
        "aria-expanded": open,
        "aria-haspopup": "dialog",
        onClick: () => setOpen(!open),
        ref: triggerRef,
      })}
      {open ? (
        <div
          style={shift === 0 ? undefined : { transform: `translateX(${shift}px)` }}
          className={cn("absolute top-[calc(100%+0.5rem)] z-overlay", align === "end" ? "right-0" : "left-0")}
        >
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-label={label}
            tabIndex={-1}
            className={cn(
              "max-h-[min(32rem,calc(100vh-6rem))] overflow-y-auto outline-none",
              POPOVER_SURFACE,
              className ?? "w-[min(25rem,calc(100vw-1rem))]",
            )}
          >
            {children}
          </div>
        </div>
      ) : null}
    </div>
  )
}
