import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "../lib/cn.js"

export interface SectionProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  actions?: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  icon?: ReactNode
  /**
   * `display` gives the plain variant the page-level scale — a fluid heading up
   * to 3.25rem and a lede. Use it for the two or three regions a page is
   * navigated by, not for every block on it.
   */
  size?: "default" | "display"
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
  size = "default",
  title,
  variant = "card",
  ...props
}: SectionProps) {
  if (variant === "plain") {
    const isDisplay = size === "display"

    return (
      <section className={cn("grid min-w-0 gap-8 border-t border-edge py-12", className)} {...props}>
        {/* Eyebrow, then icon beside the heading, then description — one
         * left-hand column at every width. The heading used to move into the
         * second column of a 10rem rail at md, which left it indented on a
         * tablet or a desktop while it sat flush on a phone: the same region
         * read as two different layouts depending on the screen, and the wider
         * one buried its own title.
         *
         * The eyebrow leads. It is a kicker — it says which region of the page
         * you have arrived at, and a kicker printed under its own headline is
         * an afterthought rather than a signpost. This variant used to emit the
         * heading first while the card variant below and `PageHeader` both led
         * with the eyebrow, so the same design language read in two different
         * orders depending on which page you landed on. Nothing argued for the
         * old order; it was not deliberate. */}
        <div className="grid grid-cols-1 gap-2">
          {eyebrow ? (
            <p className="m-0 self-start font-mono text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
              {eyebrow}
            </p>
          ) : null}
          <div className="flex min-w-0 items-center gap-3">
            {icon ? (
              <span className="inline-grid size-10 shrink-0 place-items-center rounded-lg border border-primary/30 bg-primary-soft text-primary">
                {icon}
              </span>
            ) : null}
            <h2
              className={cn(
                "m-0 text-fg",
                isDisplay
                  ? "text-display font-bold tracking-[-0.025em]"
                  : "text-2xl font-semibold leading-tight",
              )}
            >
              {title}
            </h2>
          </div>
          <div className="grid min-w-0 gap-3">
            {description ? (
              <p
                className={cn(
                  "m-0 leading-relaxed text-fg-muted",
                  isDisplay ? "max-w-[58ch] text-lg" : "text-base",
                )}
              >
                {description}
              </p>
            ) : null}
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
          </div>
        </div>
        <div className="min-w-0">{children}</div>
      </section>
    )
  }

  /* The card variant is the same two-surface object as Card, so a Section and a
   * Card read as one family at two sizes. The package used to pad a shell by
   * 1px and float the header inside it — a card in a card. */
  return (
    <section
      className={cn(
        "relative min-w-0 overflow-hidden rounded-xl bg-surface shadow-raised",
        "after:pointer-events-none after:absolute after:inset-0 after:z-[2] after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-edge after:content-['']",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-4 border-b border-edge bg-surface-raised px-5 py-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? <div className="mt-1 shrink-0 text-fg-subtle">{icon}</div> : null}
          <div className="grid min-w-0 gap-1">
            {eyebrow ? (
              <div className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-fg-subtle">
                {eyebrow}
              </div>
            ) : null}
            <h2 className="m-0 text-lg font-semibold text-fg">{title}</h2>
            {description ? <p className="m-0 text-sm text-fg-muted">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="px-5 py-5">{children}</div>
    </section>
  )
}

export function SettingsSection(props: SectionProps) {
  return <Section {...props} className={cn("bg-surface", props.className)} />
}
