import type { ReactNode } from "react"

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
 * not need a container to say so. */
export function PageHeader({ actions, breadcrumb, description, eyebrow, title }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-edge pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {breadcrumb ? <div className="mb-3 text-sm text-fg-muted">{breadcrumb}</div> : null}
        {eyebrow ? (
          <p className="m-0 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">{eyebrow}</p>
        ) : null}
        <h1 className="m-0 mt-2 text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.05] tracking-[-0.025em] text-fg">
          {title}
        </h1>
        {description ? <p className="m-0 mt-3 max-w-[60ch] text-sm text-fg-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}
