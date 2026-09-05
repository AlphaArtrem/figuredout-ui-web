import type { ReactNode } from "react"
import { cn } from "../lib/cn.js"

export interface PageHeaderProps {
  actions?: ReactNode
  breadcrumb?: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  title: ReactNode
}

/* Type on the page ground with a rule under it, not a card.
 *
 * The package wrapped this in the same padded shell as Card and Section, which
 * made the top of every page a box inside a box. The title IS the page; it does
 * not need a container to say so.
 *
 * 12 — the header used to be `flex-col` below `lg`, which put the page's
 * primary action under the description: on a phone "Add editor" sat alone in the
 * middle of the page, at y = 170 on /entities, above a divider and below a
 * paragraph nobody reads twice. The action belongs at the top of the page, and
 * the top of the page on a phone is the title line.
 *
 * It is a two-column grid rather than a reordered flex column, because the wide
 * layout must not move — the actions align to the BOTTOM of the title-plus-
 * description block at `lg`, and that is a row span, not an order. So: the title
 * is row 1 column 1, the description row 2 column 1, and the actions sit in
 * column 2 beside the title, dropping to `row-span-2 self-end` at `lg` to land
 * exactly where `lg:items-end lg:justify-between` used to put them. One node,
 * one accessibility tree, no duplicated button hidden at a breakpoint.
 *
 * This is the smaller of the two fixes the review costed. The larger one — the
 * page's primary action rendered INTO the app's top bar below 768 — needs a slot
 * `DashboardShell` does not have and a portal or context to reach it, and
 * building a second shell inside this package to get one would be worse than the
 * defect. It is written down in the consuming app's docs/future-scope.md.
 */
export function PageHeader({ actions, breadcrumb, description, eyebrow, title }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "grid items-start border-b border-edge pb-5",
        /* A single track when there is nothing to put beside the title: a
         * second, empty column still spends the column gap. */
        actions ? "grid-cols-[minmax(0,1fr)_auto] gap-x-4" : "grid-cols-[minmax(0,1fr)]",
      )}
    >
      <div className="col-start-1 row-start-1 min-w-0">
        {breadcrumb ? <div className="mb-3 text-sm text-fg-muted">{breadcrumb}</div> : null}
        {eyebrow ? (
          <p className="m-0 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">{eyebrow}</p>
        ) : null}
        <h1 className="m-0 mt-2 text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.025em] text-fg">
          {title}
        </h1>
      </div>
      {actions ? (
        /* `justify-end` so a set that wraps stays flush with the page edge
         * rather than drifting into the title's column. */
        <div className="col-start-2 row-start-1 flex flex-wrap items-center justify-end gap-2 self-center lg:row-span-2 lg:self-end">
          {actions}
        </div>
      ) : null}
      {description ? (
        <p className="col-start-1 row-start-2 m-0 mt-3 max-w-[60ch] text-sm text-fg-muted">{description}</p>
      ) : null}
    </div>
  )
}
