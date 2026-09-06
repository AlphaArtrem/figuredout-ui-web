import type { HTMLAttributes } from "react"
import { cn } from "../lib/cn.js"

type BadgeTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info"

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Renders a leading dot, turning the badge into a status rather than a label. */
  dot?: boolean
  tone?: BadgeTone
}

/* The ring is the tone's own hue, not neutral --color-edge: a success badge
 * should read as one object, not as a green fill inside a grey outline. */
const TONE_STYLES: Record<BadgeTone, string> = {
  neutral: "bg-surface-sunken text-fg-muted ring-edge",
  primary: "bg-primary-soft text-primary ring-primary/30",
  success: "bg-success-soft text-success ring-success/30",
  warning: "bg-warning-soft text-warning ring-warning/30",
  danger: "bg-danger-soft text-danger ring-danger/30",
  info: "bg-info-soft text-info ring-info/30",
}

export function Badge({ children, className, dot = false, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        /* `whitespace-nowrap` is review finding 14. A rounded capsule is a
         * shape that says "one short thing"; a two-line one reads as a layout
         * accident because it is. In a narrow table column "In Conversation"
         * broke inside its own pill and rendered 40px tall against a 24px
         * badge. Every badge in a consuming product was one narrow column away
         * from the same break, so the floor belongs here rather than in a
         * `className` at each call site. `cn` is a join, not a merge, so this
         * is a floor and not a default: a badge that genuinely has to wrap
         * needs a prop here, not a class at the call site. Nothing in either
         * consumer wants one — every badge in the product is a status, a count
         * or a one- or two-word label. */
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        TONE_STYLES[tone],
        className,
      )}
      {...props}
    >
      {dot ? <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" /> : null}
      {children}
    </span>
  )
}
