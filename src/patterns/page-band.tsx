import type { HTMLAttributes } from "react"
import { cn } from "../lib/cn.js"

export interface PageBandProps extends HTMLAttributes<HTMLElement> {
  /** Vertical rhythm between bands. `none` when the band supplies its own. */
  spacing?: "none" | "normal" | "loose"
  /** Draws the divider that separates this band from the one above it. */
  divided?: boolean
}

const SPACING: Record<NonNullable<PageBandProps["spacing"]>, string> = {
  none: "",
  normal: "py-12",
  loose: "py-[clamp(3rem,7vw,6rem)]",
}

/* Content stays inside the measure; the rules between sections run edge to
 * edge. That is the whole page layout idea, and it is why the band carries the
 * divider while the inner wrapper carries the width.
 *
 * The two values come from tokens — --measure and --gut — so page width stops
 * being redecided in every app. */
export function PageBand({ children, className, divided = true, spacing = "loose", ...props }: PageBandProps) {
  return (
    <section className={cn(divided && "border-t border-edge", SPACING[spacing], className)} {...props}>
      <div className="mx-auto min-w-0 max-w-measure px-gut">{children}</div>
    </section>
  )
}
