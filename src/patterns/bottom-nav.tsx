"use client"

import type { ReactElement, ReactNode } from "react"
import { cn } from "../lib/cn.js"

export interface BottomNavItem {
  /** Drawn in place of `icon` while the item is active — a filled glyph, usually. */
  activeIcon?: ReactNode
  /** A count on the icon. Numbers over 99 show as "99+". Omit or pass 0 for none. */
  badge?: number | string
  /** What the badge means, read after the label — "3 unread". Defaults to the badge itself. */
  badgeLabel?: string
  disabled?: boolean
  /** Renders the item as a link. Without it the item is a button that calls `onItemSelect`. */
  href?: string
  icon: ReactNode
  id: string
  label: ReactNode
}

export interface BottomNavLinkRenderProps {
  "aria-current": "page" | undefined
  children: ReactNode
  className: string
  href: string
  item: BottomNavItem
}

export interface BottomNavProps {
  activeItemId?: string
  /** Colour of the count badges. `warning` by default — a count here is something waiting on the reader. */
  badgeTone?: "primary" | "warning" | "danger"
  className?: string
  /** Pin to the bottom of the viewport. Off by default: in a full-height flex column it should be the last row instead. */
  fixed?: boolean
  /** Up to five. More than five do not fit a phone at a usable size — put the rest behind a "More" item. */
  items: BottomNavItem[]
  /** Names the landmark. `"Primary"` by default. */
  label?: string
  /** Called for button items, and for link items too (before the navigation), with the item's id. */
  onItemSelect?: (itemId: string) => void
  /**
   * Draws a link item with the app's router link — Next's `Link`, say. Spread the
   * props onto it. Without it a link item is a plain `<a>`.
   */
  renderLink?: (props: BottomNavLinkRenderProps) => ReactElement
}

const BADGE_TONES = {
  primary: "bg-primary text-primary-fg",
  warning: "bg-warning text-surface-sunken",
  danger: "bg-danger text-danger-fg",
} as const

function formatBadge(badge: number | string) {
  return typeof badge === "number" && badge > 99 ? "99+" : String(badge)
}

/*
 * A phone's primary navigation, under the thumb.
 *
 * Items are buttons that report an id, as `DashboardShell`'s are, unless they
 * carry an `href` — then links, drawn by `renderLink` when the app has a router.
 * Each target is at least 52px tall, over the 44px floor. The bar clears a phone's
 * home indicator with `env(safe-area-inset-bottom)`, which only reads non-zero when
 * the page sets `viewport-fit=cover` in its viewport meta.
 *
 * The active item is marked with `aria-current="page"` and drawn in the primary
 * hue; the count badge is decoration with its words (`badgeLabel`) in the item's
 * name, so "Inbox" becomes "Inbox 3 unread" rather than a bare "Inbox 3".
 */
export function BottomNav({
  activeItemId,
  badgeTone = "warning",
  className,
  fixed = false,
  items,
  label = "Primary",
  onItemSelect,
  renderLink,
}: BottomNavProps) {
  return (
    <nav
      aria-label={label}
      className={cn(
        "border-t border-edge bg-[color-mix(in_srgb,var(--color-bg)_82%,transparent)] px-1.5 pt-1.5 backdrop-blur-xl",
        "pb-[max(0.375rem,env(safe-area-inset-bottom))]",
        fixed && "fixed inset-x-0 bottom-0 z-nav",
        className,
      )}
    >
      {/* One equal column per item, whatever the count. */}
      <ul role="list" className="m-0 grid list-none auto-cols-fr grid-flow-col p-0">
        {items.map((item) => {
          const active = item.id === activeItemId
          const hasBadge = item.badge !== undefined && item.badge !== 0 && item.badge !== ""
          const itemClassName = cn(
            "relative flex min-h-[3.25rem] w-full flex-col items-center justify-center gap-0.5 rounded-md px-1 text-[0.6875rem] leading-tight no-underline",
            "transition-colors duration-fast ease-standard",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-focus-ring",
            active ? "font-semibold text-primary" : "font-medium text-fg-subtle hover:text-fg",
            item.disabled && "pointer-events-none opacity-45",
          )
          const content = (
            <>
              <span aria-hidden="true" className="relative flex size-6 items-center justify-center">
                {active && item.activeIcon ? item.activeIcon : item.icon}
                {hasBadge ? (
                  <span
                    className={cn(
                      "absolute -top-1 left-[calc(50%+0.25rem)] grid h-[1.0625rem] min-w-[1.0625rem] place-items-center rounded-full px-1",
                      "font-mono text-[0.625rem] font-semibold tabular-nums leading-none ring-2 ring-background",
                      BADGE_TONES[badgeTone],
                    )}
                  >
                    {formatBadge(item.badge as number | string)}
                  </span>
                ) : null}
              </span>
              <span className="max-w-full truncate">{item.label}</span>
              {hasBadge ? <span className="sr-only">{item.badgeLabel ?? formatBadge(item.badge as number | string)}</span> : null}
            </>
          )
          const ariaCurrent = active ? ("page" as const) : undefined

          if (item.href && !item.disabled) {
            const href = item.href
            return (
              <li key={item.id} className="min-w-0">
                {renderLink ? (
                  renderLink({ "aria-current": ariaCurrent, children: content, className: itemClassName, href, item })
                ) : (
                  <a href={href} aria-current={ariaCurrent} className={itemClassName} onClick={() => onItemSelect?.(item.id)}>
                    {content}
                  </a>
                )}
              </li>
            )
          }

          return (
            <li key={item.id} className="min-w-0">
              <button
                type="button"
                aria-current={ariaCurrent}
                disabled={item.disabled}
                className={itemClassName}
                onClick={() => onItemSelect?.(item.id)}
              >
                {content}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
