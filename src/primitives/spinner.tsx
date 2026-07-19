import { ArrowClockwise } from "../icons/index.js"
import { cn } from "../lib/cn.js"

export interface SpinnerProps {
  className?: string
  label?: string
  size?: number
}

export function Spinner({ className, label = "Loading", size = 16 }: SpinnerProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-fg-muted", className)} role="status">
      <ArrowClockwise size={size} className="animate-spin" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  )
}
