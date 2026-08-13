import type { ReactNode } from "react"
import { cn } from "../lib/cn.js"
import { Table } from "./table.js"
import type { TableProps } from "./table.js"

export interface TableSectionProps<T> extends TableProps<T> {
  actions?: ReactNode
  caption?: ReactNode
  className?: string
  description?: ReactNode
  icon?: ReactNode
  title: ReactNode
}

/* The section is the container, so the table inside it is never framed — that
 * is the "one table" rule doing its job. */
export function TableSection<T>({
  actions,
  caption,
  className,
  description,
  icon,
  title,
  ...tableProps
}: TableSectionProps<T>) {
  return (
    <section className={cn("grid min-w-0 gap-4", className)}>
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? (
            <span className="inline-grid size-9 shrink-0 place-items-center rounded-md border border-primary/30 bg-primary-soft text-primary">
              {icon}
            </span>
          ) : null}
          <div className="grid min-w-0 gap-1">
            <h3 className="m-0 text-sm font-semibold text-fg">{title}</h3>
            {description ? <p className="m-0 text-sm leading-relaxed text-fg-muted">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      <Table {...tableProps} framed={false} />
      {caption ? <p className="m-0 text-xs text-fg-subtle">{caption}</p> : null}
    </section>
  )
}
