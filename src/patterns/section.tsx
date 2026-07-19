import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "../lib/cn.js"

export interface SectionProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  actions?: ReactNode
  description?: ReactNode
  title: ReactNode
}

export function Section({
  actions,
  children,
  className,
  description,
  title,
  ...props
}: SectionProps) {
  return (
    <section className={cn("rounded-xl bg-surface p-1 shadow-raised ring-1 ring-inset ring-edge", className)} {...props}>
      <div className="flex flex-col gap-4 rounded-lg bg-surface-raised px-5 py-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-fg">{title}</h2>
          {description ? <p className="mt-1 text-sm text-fg-muted">{description}</p> : null}
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
