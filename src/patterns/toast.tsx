"use client"

import { createContext, useContext, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
import { CheckCircle, Info, WarningCircle, X } from "../icons/index.js"
import { cn } from "../lib/cn.js"
import { Button, IconButton } from "../primitives/button.js"

type ToastTone = "success" | "info" | "warning" | "danger"

export interface ToastOptions {
  action?: {
    label: string
    onClick: () => void
  }
  description?: string
  duration?: number
  tone?: ToastTone
  title: string
}

interface ToastRecord extends ToastOptions {
  id: string
}

interface ToastContextValue {
  dismissToast: (id: string) => void
  pushToast: (toast: ToastOptions) => string
}

const ToastContext = createContext<ToastContextValue | null>(null)

const TONE_STYLES: Record<ToastTone, string> = {
  success: "bg-success-soft text-success",
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
}

const TONE_ICONS = {
  success: CheckCircle,
  info: Info,
  warning: WarningCircle,
  danger: WarningCircle,
} as const

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])
  const idRef = useRef(0)

  const value = useMemo<ToastContextValue>(
    () => ({
      dismissToast: (id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id))
      },
      pushToast: (toast) => {
        const id = `toast-${idRef.current + 1}`
        idRef.current += 1
        const record: ToastRecord = { duration: 4000, tone: "info", ...toast, id }
        setToasts((current) => [...current, record])
        window.setTimeout(() => {
          setToasts((current) => current.filter((entry) => entry.id !== id))
        }, record.duration)
        return id
      },
    }),
    [],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-toast flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const Icon = TONE_ICONS[toast.tone ?? "info"]
          const tone = toast.tone ?? "info"
          return (
            <div
              key={toast.id}
              role="status"
              aria-live="polite"
              className="pointer-events-auto rounded-lg bg-surface p-1 shadow-overlay ring-1 ring-inset ring-edge"
            >
              <div className="flex items-start gap-3 rounded-md bg-surface-raised px-4 py-3">
                <span className={cn("mt-0.5 inline-flex rounded-full p-1", TONE_STYLES[tone])}>
                  <Icon size={16} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-semibold text-fg">{toast.title}</p>
                  {toast.description ? <p className="text-sm text-fg-muted">{toast.description}</p> : null}
                  {toast.action ? (
                    <Button variant="ghost" size="sm" onClick={toast.action.onClick}>
                      {toast.action.label}
                    </Button>
                  ) : null}
                </div>
                <IconButton
                  aria-label="Dismiss notification"
                  variant="ghost"
                  size="sm"
                  icon={<X size={14} aria-hidden="true" />}
                  onClick={() => value.dismissToast(toast.id)}
                />
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
