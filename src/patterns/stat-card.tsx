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
    <div className="flex min-w-0 flex-col rounded-lg border border-edge bg-surface-raised p-4 transition duration-normal ease-standard hover:-translate-y-0.5 hover:border-edge-strong hover:shadow-hover motion-reduce:transform-none">
      <div className="flex items-start justify-between gap-3">
        <p className="m-0 min-w-0 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-fg-subtle">{title}</p>
        {icon ? <div className="inline-grid size-8 shrink-0 place-items-center rounded-md border border-primary/30 bg-primary-soft text-primary [&_svg]:size-4">{icon}</div> : null}
      </div>
      <p className="mt-2 break-words font-mono text-xl font-semibold leading-snug tabular-nums text-fg">{value}</p>
      <div className="mt-3 flex items-center gap-2">
        {delta ? <Badge tone={tone}>{delta}</Badge> : null}
        {description ? <div className="flex-1 text-[0.8125rem] leading-relaxed text-fg-muted">{description}</div> : null}
      </div>
    </div>
  )
}
