import type { HTMLAttributes } from "react"
import { cn } from "../lib/cn.js"

type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info"

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
}

const TONE_STYLES: Record<BadgeTone, string> = {
  neutral: "bg-surface-sunken text-fg-muted ring-edge",
  primary: "bg-primary-soft text-primary ring-edge",
  success: "bg-success-soft text-success ring-edge",
  warning: "bg-warning-soft text-warning ring-edge",
  danger: "bg-danger-soft text-danger ring-edge",
  info: "bg-info-soft text-info ring-edge",
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        TONE_STYLES[tone],
        className,
      )}
      {...props}
    />
  )
}
