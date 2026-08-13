import type { HTMLAttributes } from "react"
import { cn } from "../lib/cn.js"

/* A left-to-right sweep rather than an opacity pulse. A pulse reads as
 * something asking for attention; a sweep reads as something still arriving —
 * and on the light ladder a pulsing sunken block flickered against the card
 * behind it. `motion-reduce` leaves a flat sunken block. */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-surface-sunken",
        "bg-[linear-gradient(90deg,var(--color-surface-sunken)_0%,var(--color-surface-raised)_50%,var(--color-surface-sunken)_100%)] bg-[length:200%_100%]",
        "motion-reduce:animate-none motion-reduce:bg-none",
        className,
      )}
      aria-hidden="true"
      {...props}
    />
  )
}
