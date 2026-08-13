import { cn } from "../lib/cn.js"

export interface SpinnerProps {
  className?: string
  label?: string
  size?: number
}

/* A ring rather than a spinning arrow glyph: at 16px the arrow's tail is a
 * smear, and a ring reads as progress at any size. Sized inline because the
 * caller passes pixels. */
export function Spinner({ className, label = "Loading", size = 16 }: SpinnerProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-fg-muted", className)} role="status">
      <span
        aria-hidden="true"
        className="inline-block animate-spin rounded-full border-2 border-primary-soft border-t-primary motion-reduce:animate-none"
        style={{ width: size, height: size }}
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}
