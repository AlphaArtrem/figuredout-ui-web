"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import type { MutableRefObject, RefObject } from "react"
import { trapFocus } from "./overlay.js"

/*
 * The modal focus contract, shared by `Dialog` and `CommandPalette`: remember
 * what had focus, move focus in (to `initialFocusRef`, else the first focusable
 * element, else the container), trap Tab inside, close on Escape, and give focus
 * back on close — to where it came from, if that element is still in the page.
 *
 * The previously-focused element is captured in a layout effect, before the
 * rAF below moves focus into the container; captured any later, it would be the
 * container itself.
 */
export function useDialogFocus({
  containerRef,
  initialFocusRef,
  onOpenChange,
  open,
}: {
  containerRef: MutableRefObject<HTMLDivElement | null>
  initialFocusRef?: RefObject<HTMLElement> | undefined
  onOpenChange: (open: boolean) => void
  open: boolean
}) {
  const previousActiveRef = useRef<HTMLElement | null>(null)

  useLayoutEffect(() => {
    if (!open) {
      return
    }

    previousActiveRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
  }, [open])

  useEffect(() => {
    if (!open || !containerRef.current) {
      return
    }

    const container = containerRef.current

    const focusTarget = initialFocusRef?.current
    window.requestAnimationFrame(() => {
      if (focusTarget) {
        focusTarget.focus()
      } else {
        const firstFocusable = container.querySelector<HTMLElement>(
          "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
        )
        ;(firstFocusable ?? container).focus()
      }
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onOpenChange(false)
        return
      }

      trapFocus(event, container)
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      const previousActive = previousActiveRef.current
      window.requestAnimationFrame(() => {
        if (previousActive?.isConnected) {
          previousActive.focus()
        }
      })
      previousActiveRef.current = null
    }
  }, [containerRef, initialFocusRef, onOpenChange, open])
}
