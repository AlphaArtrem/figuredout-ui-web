"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
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

/** Space kept between the trigger and the menu, matching the offset classes below. */
const MENU_GAP = 8

/* The measurement has to land before the browser paints, or the menu is drawn in
 * the wrong place for a frame and then jumps. Menus only open from a pointer or a
 * key, so this never runs while rendering on the server. */
const useMeasureEffect = typeof window === "undefined" ? useEffect : useLayoutEffect

/**
 * The rect of the nearest ancestor that will clip this menu — a scroller, a card
 * with `overflow-hidden` — falling back to the viewport when nothing does.
 *
 * `Table`'s scroller is the case this exists for: it is `overflow-x-auto`, which
 * computes `overflow-y: auto`, so a menu opened from the last row is sliced off
 * at the scroller's bottom edge *and* makes the scroller grow a vertical
 * scrollbar. The viewport is not the boundary that matters there.
 */
const CLIPPING_OVERFLOW = new Set(["auto", "clip", "hidden", "scroll"])

function clippingBounds(element: HTMLElement): { bottom: number; top: number } {
  for (let node = element.parentElement; node; node = node.parentElement) {
    /* Named values rather than `!== "visible"`: an engine that does not compute
     * the property at all reports the empty string, and reading that as a clip
     * would stop the walk at the first ancestor every time. */
    if (CLIPPING_OVERFLOW.has(window.getComputedStyle(node).overflowY)) {
      const rect = node.getBoundingClientRect()
      /* Intersected with the viewport, because a scroller can extend past it and
       * the smaller of the two is what the user can actually see (traps §88). */
      return { bottom: Math.min(rect.bottom, window.innerHeight), top: Math.max(rect.top, 0) }
    }
  }
  return { bottom: window.innerHeight, top: 0 }
}

export interface DropdownMenuProps {
  /** Which edge of the trigger the menu hangs from. */
  align?: "start" | "end"
  items: DropdownMenuItem[]
  label?: string
  triggerLabel?: ReactNode
  /**
   * How big the trigger is. `sm` — 36px, the default — is what every consumer
   * rendered before this prop existed and is kept so adding it changes nothing;
   * `md` is 44px, the pointer-target floor, and is what a row-level overflow
   * menu wants now that it is the only action control on the row.
   */
  triggerSize?: "sm" | "md"
  triggerVariant?: "button" | "icon"
}

export function DropdownMenu({
  align = "end",
  items,
  label = "Open menu",
  triggerLabel = "Actions",
  triggerSize = "sm",
  triggerVariant = "button",
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const [placement, setPlacement] = useState<"above" | "below">("below")
  const { ref: menuRef, shift } = useViewportClamp<HTMLDivElement>(open)

  /* Hang the menu upward when downward does not fit inside whatever clips it.
   *
   * A portal would take the menu out of the clipping ancestor entirely, and it is
   * the more general answer — but it also means fixed coordinates recomputed on
   * every scroll and resize, an anchor the `align` classes and the horizontal
   * clamp no longer describe, and a second stacking context to reason about. The
   * flip is a class swap on the wrapper that already exists, so it is the smaller
   * correct fix; a portal is what to reach for if a menu ever has to escape a
   * container that clips it on both sides.
   *
   * Everything here is measured from the TRIGGER, not from the menu, so the
   * answer does not depend on where the menu currently is and the decision cannot
   * oscillate between the two placements. */
  useMeasureEffect(() => {
    if (!open) {
      setPlacement("below")
      return
    }

    const choosePlacement = () => {
      const menu = menuRef.current
      const trigger = triggerRef.current
      if (!menu || !trigger) {
        return
      }
      const bounds = clippingBounds(trigger)
      const triggerRect = trigger.getBoundingClientRect()
      const height = menu.offsetHeight
      const roomBelow = bounds.bottom - triggerRect.bottom - MENU_GAP
      const roomAbove = triggerRect.top - bounds.top - MENU_GAP
      /* Only when it does not fit below AND above is genuinely roomier: a menu
       * taller than both sides stays below, where reading starts. */
      setPlacement(height > roomBelow && roomAbove > roomBelow ? "above" : "below")
    }

    choosePlacement()
    window.addEventListener("resize", choosePlacement)
    return () => window.removeEventListener("resize", choosePlacement)
  }, [menuRef, open])

  /* Put focus back on the trigger when the menu closes — but only when focus is
   * still inside this component, which is the whole of the rule.
   *
   * Closing from inside the menu (Escape on an item, or selecting one) unmounts
   * the element focus was on, and the browser's fallback is `<body>`: a keyboard
   * user who opened a row menu and changed their mind is returned to the top of
   * the document. Closing from *outside* — a mouse click elsewhere on the page —
   * has already moved focus somewhere the user chose, and pulling it back would
   * be the component stealing it. The containment check distinguishes the two
   * without the component having to track how it was closed, and it makes
   * Escape-while-still-on-the-trigger a no-op rather than a second restore. */
  const restoreFocusToTrigger = () => {
    const container = containerRef.current
    const trigger = triggerRef.current
    const active = document.activeElement
    if (container && trigger && active && container.contains(active)) {
      trigger.focus()
    }
  }

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
        restoreFocusToTrigger()
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
          ref={triggerRef}
          aria-label={label}
          variant="ghost"
          size={triggerSize}
          icon={<DotsThree size={18} aria-hidden="true" />}
          /* Both halves of "this opens a menu": what it opens, and whether it is
           * open. The button variant has always carried `aria-expanded`; the
           * icon variant carried neither, so an icon-only trigger announced as a
           * plain button that would do something rather than reveal something. */
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        />
      ) : (
        <Button
          ref={triggerRef}
          variant="secondary"
          size={triggerSize}
          trailingIcon={<CaretDown size={16} aria-hidden="true" />}
          aria-haspopup="menu"
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
            "absolute z-overlay",
            placement === "above" ? "bottom-[calc(100%+0.5rem)]" : "top-[calc(100%+0.5rem)]",
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
                  /* Restore first: while the item this click focused is still
                   * mounted for the containment check to see, and before
                   * `onSelect` — an item that opens a dialog moves focus into it
                   * on the next commit, and that has to be the last word. */
                  restoreFocusToTrigger()
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
