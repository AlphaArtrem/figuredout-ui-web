import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "../lib/cn.js"

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  action?: ReactNode
  description: ReactNode
  icon?: ReactNode
  title: ReactNode
}

/* No dashed border. A dashed rectangle means "drop something here", which is a
 * different component; an empty table is simply empty. */
export function EmptyState({ action, className, description, icon, title, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "grid justify-items-center gap-2 rounded-xl bg-surface px-6 py-10 text-center ring-1 ring-inset ring-edge",
        className,
      )}
      {...props}
    >
      {icon ? (
        <div className="mb-2 inline-grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
          {icon}
        </div>
      ) : null}
      <h3 className="m-0 text-lg font-semibold text-fg">{title}</h3>
      <p className="m-0 max-w-md text-sm text-fg-muted">{description}</p>
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  )
}
