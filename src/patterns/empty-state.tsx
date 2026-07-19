import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "../lib/cn.js"

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  action?: ReactNode
  description: ReactNode
  icon?: ReactNode
  title: ReactNode
}

export function EmptyState({
  action,
  className,
  description,
  icon,
  title,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-edge bg-surface-raised px-6 py-10 text-center",
        className,
      )}
      {...props}
    >
      {icon ? <div className="mx-auto mb-4 inline-flex rounded-full bg-primary-soft p-3 text-primary">{icon}</div> : null}
      <h3 className="text-lg font-semibold text-fg">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-fg-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
