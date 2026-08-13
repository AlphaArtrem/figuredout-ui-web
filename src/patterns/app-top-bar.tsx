import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react"
import { cn } from "../lib/cn.js"

export interface AppTopBarNavItem extends AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean
  label: ReactNode
}

export interface AppTopBarProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  actions?: ReactNode
  logo?: ReactNode
  navItems?: AppTopBarNavItem[]
  sticky?: boolean
  subtitle?: ReactNode
  title: ReactNode
}

export function AppTopBar({
  actions,
  className,
  logo,
  navItems = [],
  sticky = true,
  subtitle,
  title,
  ...props
}: AppTopBarProps) {
  return (
    <header
      className={cn(
        "border-b border-edge bg-[color-mix(in_srgb,var(--color-bg)_82%,transparent)] backdrop-blur-xl",
        sticky && "sticky top-0 z-nav",
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex min-h-14 w-full max-w-[90rem] flex-wrap items-center gap-x-2 gap-y-2 px-4 py-2 lg:gap-x-3 lg:px-8">
        <div className="flex min-w-0 shrink-0 items-center gap-1.5 lg:gap-2">
          {logo ? <div className="flex shrink-0 items-center">{logo}</div> : null}
          <div className="flex min-w-0 items-baseline gap-1.5 lg:gap-2">
            <div className="truncate font-mono text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-fg lg:text-sm lg:tracking-[0.14em]">{title}</div>
            {subtitle ? <div className="truncate rounded-sm border border-edge bg-surface-raised px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.06em] text-fg-muted lg:px-2 lg:py-1 lg:text-[0.6875rem] lg:tracking-[0.08em]">{subtitle}</div> : null}
          </div>
        </div>

        {navItems.length > 0 ? (
          <nav className="order-3 flex min-w-0 basis-full items-center justify-between gap-3 overflow-x-auto [scrollbar-width:none] md:order-none md:basis-auto md:flex-1 md:justify-start [&::-webkit-scrollbar]:hidden" aria-label="Primary">
            {navItems.map(({ active, className: itemClassName, label, ...item }) => (
              <a
                key={`${item.href ?? ""}-${String(label)}`}
                className={cn(
                  /* The active mark is a scaled pseudo-element, not a border:
                   * a border appearing on hover nudges the label by a pixel. */
                  "relative whitespace-nowrap py-2 text-[0.8125rem] font-medium text-fg-muted transition duration-fast ease-standard hover:text-fg focus-visible:text-fg focus-visible:outline-none",
                  "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-sm after:bg-primary after:transition-transform after:duration-normal after:ease-standard after:content-['']",
                  "after:scale-x-0 hover:after:scale-x-100 focus-visible:after:scale-x-100",
                  active && "font-semibold text-fg after:scale-x-100",
                  itemClassName,
                )}
                aria-current={active ? "page" : item["aria-current"]}
                {...item}
              >
                {label}
              </a>
            ))}
          </nav>
        ) : null}

        {actions ? (
          <div className="order-none ml-auto flex min-w-0 flex-none basis-auto items-center justify-end gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  )
}
