import type { ReactNode } from "react"
import { cn } from "../lib/cn.js"

export interface PageHeaderProps {
  actions?: ReactNode
  breadcrumb?: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  title: ReactNode
}

export function PageHeader({ actions, breadcrumb, description, eyebrow, title }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl bg-surface p-1 shadow-raised ring-1 ring-inset ring-edge lg:flex-row lg:items-end lg:justify-between">
      <div className="rounded-lg bg-surface-raised px-6 py-5">
        {breadcrumb ? <div className="mb-3 text-sm text-fg-muted">{breadcrumb}</div> : null}
        {eyebrow ? <p className="text-xs font-medium uppercase tracking-[0.16em] text-fg-subtle">{eyebrow}</p> : null}
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-fg">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-sm text-fg-muted">{description}</p> : null}
      </div>
      {actions ? <div className="px-6 py-5 lg:pl-0">{actions}</div> : null}
    </div>
  )
}
