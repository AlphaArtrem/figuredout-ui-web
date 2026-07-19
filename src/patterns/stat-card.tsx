import type { ReactNode } from "react"
import { cn } from "../lib/cn.js"
import { Badge } from "../primitives/badge.js"

export interface StatCardProps {
  delta?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  tone?: "neutral" | "primary" | "success" | "warning" | "danger" | "info"
  title: ReactNode
  value: ReactNode
}

export function StatCard({
  delta,
  description,
  icon,
  tone = "neutral",
  title,
  value,
}: StatCardProps) {
  return (
    <div className="rounded-xl bg-surface p-1 shadow-raised ring-1 ring-inset ring-edge">
      <div className="flex h-full flex-col rounded-lg bg-surface-raised px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-fg-muted">{title}</p>
            <p className="mt-3 font-mono text-3xl font-semibold tabular-nums text-fg">{value}</p>
          </div>
          {icon ? <div className="rounded-full bg-primary-soft p-3 text-primary">{icon}</div> : null}
        </div>
        <div className="mt-4 flex items-center gap-2">
          {delta ? <Badge tone={tone}>{delta}</Badge> : null}
          {description ? <div className="flex-1 text-sm text-fg-muted">{description}</div> : null}
        </div>
      </div>
    </div>
  )
}
