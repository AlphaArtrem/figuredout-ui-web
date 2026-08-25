import type { HTMLAttributes } from "react"
import { cn } from "../lib/cn.js"

export interface PageContentProps extends HTMLAttributes<HTMLDivElement> {}

/* The page gutter lives here, not on the shell.
 *
 * `DashboardShell`'s <main> is deliberately unpadded so `Hero` and `PageBand`
 * can run edge to edge; that leaves the gutter to whatever wraps the content,
 * and this is that wrapper. It spends `--gut` — the same token `PageBand` uses
 * internally — so page-edge spacing is decided once for the system instead of
 * re-invented per app.
 *
 * Width is left to the consumer on purpose: a reading page wants `--measure`, a
 * dashboard of card grids wants more, and imposing either here would be wrong
 * for the other. Note `cn` concatenates rather than merges, so a consumer
 * passing its own `px-*` gets both classes and the generated stylesheet decides
 * — restructure rather than fight it.
 */
export function PageContent({ className, ...props }: PageContentProps) {
  return <div className={cn("flex flex-col gap-6 px-gut pb-10", className)} {...props} />
}
