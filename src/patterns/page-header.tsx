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
        /* The action column is capped below `lg` and only there. Uncapped, a
         * two-button set on /dashboard took 256px of a 342px row and squeezed
         * "What needs you right now" into a 70px column five lines deep — the
         * title losing to its own action is not an improvement on the action
         * being lost under the description. Capped, the buttons wrap down their
         * own column and the title keeps the majority of the row. From `lg` up
         * there is room for both, so the track goes back to its content. */
        actions
          ? "grid-cols-[minmax(0,1fr)_minmax(0,45%)] gap-x-4 lg:grid-cols-[minmax(0,1fr)_auto]"
          : "grid-cols-[minmax(0,1fr)]",
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
         * rather than drifting into the title's column.
         *
         * `[&>*]:flex-wrap` is the one reach into a child here, and it earns it:
         * most call sites pass their actions inside their own `flex` row, which
         * is a single flex item to this container and so does not wrap when the
         * column is capped. It overflowed instead, and `justify-end` sent the
         * overflow LEFT, printing the buttons over the title. The utility says
         * "whatever row you brought, let it wrap"; on a child that is not a flex
         * container it does nothing at all. */
        <div className="col-start-2 row-start-1 flex flex-wrap items-center justify-end gap-2 self-center [&>*]:flex-wrap lg:row-span-2 lg:self-end">
          {actions}
        </div>
      ) : null}
      {description ? (
        /* The description spans both columns below `lg`. The action column is
           sized by its buttons and the tracks are shared down the grid, so
           leaving the description in column 1 would have narrowed a phone's
           reading width to whatever the buttons left over — 200px of 342 on
           /entities. At `lg` it goes back to one column, because that is where
           the actions sit beside it. */
        <p className="col-span-2 col-start-1 row-start-2 m-0 mt-3 max-w-[60ch] text-sm text-fg-muted lg:col-span-1">
          {description}
        </p>
      ) : null}
    </div>
  )
}
