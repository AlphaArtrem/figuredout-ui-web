"use client"

import { useEffect, useId, useRef } from "react"
import type { MutableRefObject, ReactNode, RefObject } from "react"
import { createPortal } from "react-dom"
import { X } from "../icons/index.js"
import { cn } from "../lib/cn.js"
import { trapFocus } from "../lib/overlay.js"
import { IconButton } from "../primitives/button.js"

type PanelSize = "md" | "lg"

export interface SidePanelProps {
  children: ReactNode
  description?: ReactNode
  initialFocusRef?: RefObject<HTMLElement>
  onOpenChange: (open: boolean) => void
  open: boolean
  size?: PanelSize
  title: ReactNode
}

const SIZE_STYLES: Record<PanelSize, string> = {
  md: "max-w-xl",
  lg: "max-w-2xl",
}

function usePanelFocus({
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
  useEffect(() => {
    if (!open || !containerRef.current) {
      return
    }

    const container = containerRef.current
    const previousActive = document.activeElement instanceof HTMLElement ? document.activeElement : null

    window.requestAnimationFrame(() => {
      initialFocusRef?.current?.focus()
      if (initialFocusRef?.current) {
        return
      }
      const firstFocusable = container.querySelector<HTMLElement>(
        "button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
      )
      ;(firstFocusable ?? container).focus()
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
      previousActive?.focus()
    }
  }, [containerRef, initialFocusRef, onOpenChange, open])
}

export function SidePanel({
  children,
  description,
  initialFocusRef,
  onOpenChange,
  open,
  size = "md",
  title,
}: SidePanelProps) {
  const titleId = useId()
  const descriptionId = useId()
  const containerRef = useRef<HTMLDivElement | null>(null)

  usePanelFocus({ containerRef, initialFocusRef, onOpenChange, open })

  if (!open || typeof document === "undefined") {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-overlay flex justify-end">
      <button
        type="button"
        aria-label="Close panel overlay"
        className="absolute inset-0 bg-fg/20 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-[1] flex h-full w-full flex-col bg-surface p-1 shadow-overlay ring-1 ring-inset ring-edge outline-none",
          "translate-x-0 transition duration-normal ease-standard",
          SIZE_STYLES[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 rounded-lg bg-surface-raised px-6 py-5">
          <div className="space-y-1">
            <h2 id={titleId} className="text-xl font-semibold text-fg">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="text-sm text-fg-muted">
                {description}
              </p>
            ) : null}
          </div>
          <IconButton
            aria-label="Close side panel"
            variant="ghost"
            size="sm"
            icon={<X size={16} aria-hidden="true" />}
            onClick={() => onOpenChange(false)}
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
