"use client"

import { useEffect, useId, useLayoutEffect, useRef } from "react"
import type { MutableRefObject, ReactNode, RefObject } from "react"
import { createPortal } from "react-dom"
import { X } from "../icons/index.js"
import { cn } from "../lib/cn.js"
import { trapFocus } from "../lib/overlay.js"
import { Button, IconButton } from "../primitives/button.js"

type DialogSize = "sm" | "md" | "lg"

export interface DialogProps {
  children: ReactNode
  description?: ReactNode
  footer?: ReactNode
  initialFocusRef?: RefObject<HTMLElement>
  onOpenChange: (open: boolean) => void
  open: boolean
  size?: DialogSize
  title: ReactNode
  closeOnOverlayClick?: boolean
}

const SIZE_STYLES: Record<DialogSize, string> = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
}

function useDialogFocus({
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

export function Dialog({
  children,
  closeOnOverlayClick = true,
  description,
  footer,
  initialFocusRef,
  onOpenChange,
  open,
  size = "md",
  title,
}: DialogProps) {
  const titleId = useId()
  const descriptionId = useId()
  const containerRef = useRef<HTMLDivElement | null>(null)

  useDialogFocus({ containerRef, initialFocusRef, onOpenChange, open })

  if (!open || typeof document === "undefined") {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-overlay flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog overlay"
        className="absolute inset-0 bg-fg/20 backdrop-blur-sm"
        onClick={() => {
          if (closeOnOverlayClick) {
            onOpenChange(false)
          }
        }}
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-[1] w-full rounded-xl bg-surface p-1 text-fg shadow-overlay ring-1 ring-inset ring-edge",
          "max-h-[calc(100vh-2rem)] overflow-hidden outline-none",
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
            aria-label="Close dialog"
            variant="ghost"
            size="sm"
            icon={<X size={16} aria-hidden="true" />}
            onClick={() => onOpenChange(false)}
          />
        </div>
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto px-6 py-5">{children}</div>
        {footer ? <div className="border-t border-edge px-6 py-4">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  )
}

export interface ConfirmDialogProps extends Omit<DialogProps, "children" | "footer"> {
  body: ReactNode
  confirmLabel?: string
  confirmTone?: "primary" | "danger"
  cancelLabel?: string
  onConfirm: () => void
}

export function ConfirmDialog({
  body,
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  confirmTone = "primary",
  onConfirm,
  onOpenChange,
  ...props
}: ConfirmDialogProps) {
  return (
    <Dialog
      onOpenChange={onOpenChange}
      footer={
        <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            variant={confirmTone === "danger" ? "danger" : "primary"}
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      }
      {...props}
    >
      <div className="text-sm text-fg-muted">{body}</div>
    </Dialog>
  )
}
