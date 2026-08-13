import type { ReactNode } from "react"
import { cn } from "../lib/cn.js"
import { Badge } from "../primitives/badge.js"

export interface StatCardProps {
  className?: string
  delta?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  tone?: "neutral" | "primary" | "success" | "warning" | "danger" | "info"
  title: ReactNode
  value: ReactNode
}

/* A metric tile. On its own it carries its own surface; inside a SeamGrid the
 * grid supplies the surface and the corners, so the tile drops them — which is
 * what `standalone={false}` is for. A row of related figures should read as one
 * object, not as four cards that happen to be near each other.
 *
 * The figure is sized against its CONTAINER, not the viewport: a narrow cell
 * gets smaller digits instead of a second line. The clamp's middle value is set
 * from the longest string the slot actually holds. */
export function StatCard({ className, delta, description, icon, tone = "neutral", title, value }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col rounded-xl bg-surface p-5 shadow-raised ring-1 ring-inset ring-edge",
        "transition duration-normal ease-standard hover:-translate-y-0.5 hover:shadow-hover hover:ring-edge-strong",
        "motion-reduce:transform-none",
        "[container-type:inline-size]",
        className,
      )}
    >
      <StatCardContent
        delta={delta}
        description={description}
        icon={icon}
        title={title}
        tone={tone}
        value={value}
      />
    </div>
  )
}

/**
 * The tile's contents without a surface of its own, for use as a SeamGrid cell.
 * SeamGrid owns the background, padding and corners; this owns the figure.
 */
export function StatCardContent({ delta, description, icon, title, tone = "neutral", value }: StatCardProps) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="m-0 min-w-0 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-fg-subtle">
          {title}
        </p>
        {icon ? (
          <div className="inline-grid size-8 shrink-0 place-items-center rounded-md border border-primary/30 bg-primary-soft text-primary [&_svg]:size-4">
            {icon}
          </div>
        ) : null}
      </div>
      <p className="mt-2 whitespace-nowrap font-mono text-[clamp(1.25rem,10.5cqi,2.75rem)] font-semibold leading-none tracking-[-0.02em] tabular-nums text-fg">
        {value}
      </p>
      <div className="mt-3 flex items-center gap-2">
        {delta ? <Badge tone={tone}>{delta}</Badge> : null}
        {description ? <div className="flex-1 text-[0.8125rem] leading-relaxed text-fg-muted">{description}</div> : null}
      </div>
    </>
  )
}
