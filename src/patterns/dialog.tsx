"use client"

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react"
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
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-fg)_28%,transparent)] backdrop-blur-sm"
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
          /* Three surfaces, one object: header on raised, body on surface,
           * footer on sunken — the same anatomy as Card, at overlay elevation.
           * The hairline is an overlay because the header paints its own
           * full-bleed surface over an inset ring. */
          "relative z-[1] flex w-full flex-col rounded-xl bg-surface text-fg shadow-overlay",
          "after:pointer-events-none after:absolute after:inset-0 after:z-[2] after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-edge-strong after:content-['']",
          "max-h-[calc(100vh-2rem)] overflow-hidden outline-none motion-safe:animate-rise",
          SIZE_STYLES[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-edge bg-surface-raised px-6 py-5">
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
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? <div className="border-t border-edge bg-surface-sunken px-6 py-4">{footer}</div> : null}
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
  /* Return nothing and the dialog closes the moment it is confirmed, which is
   * what it has always done. Return a promise and the dialog waits for it: the
   * confirm button goes pending, the dialog cannot be dismissed, and it closes
   * only when the promise resolves. A rejection leaves the dialog open with the
   * error in it and the button actionable again — because a destructive action
   * that silently failed is worse than one that did not run. */
  onConfirm: () => void | Promise<unknown>
  /** Turns a rejection into the sentence the dialog shows. */
  confirmErrorMessage?: (error: unknown) => string
  /** What the pending confirm button announces. */
  confirmPendingLabel?: string
}

const DEFAULT_CONFIRM_ERROR = "That didn't work. Nothing has been changed — try again."

function defaultConfirmErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  if (typeof error === "string" && error) {
    return error
  }
  return DEFAULT_CONFIRM_ERROR
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return typeof (value as PromiseLike<unknown> | null)?.then === "function"
}

export function ConfirmDialog({
  body,
  cancelLabel = "Cancel",
  confirmErrorMessage = defaultConfirmErrorMessage,
  confirmLabel = "Confirm",
  confirmPendingLabel = "Working",
  confirmTone = "primary",
  onConfirm,
  onOpenChange,
  open,
  ...props
}: ConfirmDialogProps) {
  const [pending, setPendingState] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* Mirrored into a ref so `guardedOpenChange` below can read it without being
   * rebuilt when it changes. `Dialog`'s focus effect keys on `onOpenChange`, and
   * handing it a new function mid-write tears down and re-runs the focus trap,
   * which loses the "focus goes back where it came from" anchor. */
  const pendingRef = useRef(false)
  const setPending = useCallback((next: boolean) => {
    pendingRef.current = next
    setPendingState(next)
  }, [])

  /* The dialog is usually unmounted by its caller the instant it closes, so a
   * promise that settles after the close would set state on a dead component. */
  const liveRef = useRef(true)
  useEffect(() => {
    liveRef.current = true
    return () => {
      liveRef.current = false
    }
  }, [])

  /* A dialog that was closed and reopened starts clean rather than showing the
   * error from the attempt before. */
  useEffect(() => {
    if (!open) {
      setPending(false)
      setError(null)
    }
  }, [open, setPending])

  /* One gate for every way out — Escape and the overlay both run through
   * `onOpenChange`, and so does the header's close button — so a running write
   * cannot be abandoned halfway. Opening is never blocked. */
  const guardedOpenChange = useCallback(
    (next: boolean) => {
      if (pendingRef.current && !next) {
        return
      }
      onOpenChange(next)
    },
    [onOpenChange],
  )

  const handleConfirm = useCallback(() => {
    if (pendingRef.current) {
      return
    }
    setError(null)

    let result: void | Promise<unknown>
    try {
      result = onConfirm()
    } catch (caught) {
      setError(confirmErrorMessage(caught))
      return
    }

    if (!isPromiseLike(result)) {
      onOpenChange(false)
      return
    }

    setPending(true)
    Promise.resolve(result).then(
      () => {
        if (!liveRef.current) return
        setPending(false)
        onOpenChange(false)
      },
      (caught: unknown) => {
        if (!liveRef.current) return
        setPending(false)
        setError(confirmErrorMessage(caught))
      },
    )
  }, [confirmErrorMessage, onConfirm, onOpenChange, setPending])

  return (
    <Dialog
      open={open}
      onOpenChange={guardedOpenChange}
      footer={
        <div className="space-y-3">
          {/* Same treatment as a FormField's error, for the same reason: it
            * appears in response to something the user just did, so it is
            * announced on insertion rather than waiting to be found. */}
          {error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : null}
          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <Button variant="ghost" disabled={pending} onClick={() => onOpenChange(false)}>
              {cancelLabel}
            </Button>
            <Button
              variant={confirmTone === "danger" ? "danger" : "primary"}
              loading={pending}
              loadingLabel={confirmPendingLabel}
              onClick={handleConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      }
      {...props}
    >
      <div className="text-sm text-fg-muted">{body}</div>
    </Dialog>
  )
}
