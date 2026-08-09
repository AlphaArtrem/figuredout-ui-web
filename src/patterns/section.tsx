import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "../lib/cn.js"

export interface SectionProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  actions?: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  icon?: ReactNode
  title: ReactNode
  variant?: "card" | "plain"
}

export function Section({
  actions,
  children,
  className,
  description,
  eyebrow,
  icon,
  title,
  variant = "card",
  ...props
}: SectionProps) {
  if (variant === "plain") {
    return (
      <section className={cn("grid min-w-0 gap-8 border-t border-edge py-12", className)} {...props}>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-x-5 md:gap-y-3">
          <div className="flex min-w-0 items-center gap-3 md:contents">
            {icon ? (
              <span className="inline-grid size-10 shrink-0 place-items-center rounded-lg border border-primary/30 bg-primary-soft text-primary md:row-start-1">
                {icon}
              </span>
            ) : null}
            <h2 className="m-0 text-2xl font-semibold leading-tight text-fg md:col-start-2 md:row-start-1">{title}</h2>
          </div>
          {eyebrow ? <p className="m-0 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle md:col-start-1 md:row-start-2">{eyebrow}</p> : null}
          <div className="grid min-w-0 gap-3 md:col-start-2 md:row-start-2">
            {description ? <p className="m-0 text-base leading-relaxed text-fg-muted">{description}</p> : null}
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
          </div>
        </div>
        <div className="min-w-0">{children}</div>
      </section>
    )
  }

  return (
    <section className={cn("rounded-xl bg-surface p-1 shadow-raised ring-1 ring-inset ring-edge", className)} {...props}>
      <div className="flex flex-col gap-4 rounded-lg bg-surface-raised px-5 py-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? <div className="mt-1 shrink-0 text-fg-subtle">{icon}</div> : null}
          <div className="grid min-w-0 gap-1">
            {eyebrow ? <div className="text-xs font-bold uppercase tracking-normal text-fg-subtle">{eyebrow}</div> : null}
            <h2 className="m-0 text-lg font-semibold text-fg">{title}</h2>
            {description ? <p className="m-0 text-sm text-fg-muted">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}

export function SettingsSection(props: SectionProps) {
  return <Section {...props} className={cn("bg-surface", props.className)} />
}
