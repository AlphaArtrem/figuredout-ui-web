"use client"

import { useEffect, useState } from "react"
import type { HTMLAttributes, ReactNode } from "react"
import { List } from "../icons/index.js"
import { cn } from "../lib/cn.js"
import { IconButton } from "../primitives/button.js"

export interface DashboardShellNavItem {
  disabled?: boolean
  icon?: ReactNode
  id: string
  label: ReactNode
}

export interface DashboardShellProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  actions?: ReactNode
  activeItemId?: string
  children: ReactNode
  footer?: ReactNode
  logo?: ReactNode
  navItems: DashboardShellNavItem[]
  onNavItemSelect?: (itemId: string) => void
  status?: ReactNode
  subtitle?: ReactNode
  title: ReactNode
}

export function DashboardShell({
  actions,
  activeItemId,
  children,
  className,
  footer,
  logo,
  navItems,
  onNavItemSelect,
  status,
  subtitle,
  title,
  ...props
}: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!mobileOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        setMobileOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [mobileOpen])

  const selectItem = (item: DashboardShellNavItem) => {
    if (item.disabled) {
      return
    }
    onNavItemSelect?.(item.id)
    setMobileOpen(false)
  }

  const sidebar = (
    <div className="flex h-full min-h-0 flex-col bg-surface text-fg">
      <div className="flex min-h-16 items-center gap-3 border-b border-edge px-4">
        {logo ? <div className="flex shrink-0 items-center">{logo}</div> : null}
        <div className="grid min-w-0 gap-0.5">
          <div className="truncate font-mono text-sm font-semibold uppercase tracking-[0.12em] text-fg">{title}</div>
          {subtitle ? <div className="truncate text-xs font-medium text-fg-muted">{subtitle}</div> : null}
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3" aria-label="Dashboard">
        {navItems.map((item) => {
          const active = item.id === activeItemId
          return (
            <button
              key={item.id}
              type="button"
              aria-current={active ? "page" : undefined}
              disabled={item.disabled}
              className={cn(
                "flex min-h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition duration-fast ease-standard",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring active:scale-[0.99]",
                active
                  ? "bg-primary-soft text-primary shadow-[inset_3px_0_0_var(--color-primary)]"
                  : "text-fg-muted hover:bg-surface-raised hover:text-fg",
                item.disabled && "cursor-not-allowed opacity-45",
              )}
              onClick={() => selectItem(item)}
            >
              {item.icon ? <span className="grid size-5 shrink-0 place-items-center">{item.icon}</span> : null}
              <span className="min-w-0 truncate">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {footer ? <div className="border-t border-edge p-4">{footer}</div> : null}
    </div>
  )

  return (
    <div className={cn("min-h-screen bg-background text-fg lg:flex", className)} {...props}>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-edge lg:block">
        {sidebar}
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-overlay lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            className="absolute inset-0 bg-fg/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-[1] h-full w-[min(20rem,calc(100vw-2rem))] border-r border-edge shadow-overlay">
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-nav border-b border-edge bg-background/90 backdrop-blur">
          <div className="flex min-h-14 items-center gap-3 px-4 py-2 lg:px-6">
            <IconButton
              aria-label="Open navigation"
              className="lg:hidden"
              icon={<List size={18} aria-hidden="true" />}
              onClick={() => setMobileOpen(true)}
              size="sm"
              variant="ghost"
            />
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="min-w-0 lg:hidden">
                <div className="truncate font-mono text-sm font-semibold uppercase tracking-[0.1em] text-fg">{title}</div>
                {subtitle ? <div className="truncate text-xs text-fg-muted">{subtitle}</div> : null}
              </div>
              {status ? <div className="hidden min-w-0 sm:block">{status}</div> : null}
            </div>
            {actions ? <div className="flex shrink-0 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{actions}</div> : null}
          </div>
          {status ? <div className="border-t border-edge px-4 py-2 sm:hidden">{status}</div> : null}
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
