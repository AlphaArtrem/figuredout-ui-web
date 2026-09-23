"use client"

import { useId } from "react"
import type { ReactElement, ReactNode } from "react"
import { cn } from "../lib/cn.js"
import { Badge } from "../primitives/badge.js"
import { Button } from "../primitives/button.js"

export type NotificationTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info"

export interface NotificationItem {
  /** Machine-readable form of `time`. When set, `time` renders inside a `<time>`. */
  dateTime?: string
  /** Opens the thing the notification is about. Without it (and without `onSelect`) the row is not interactive. */
  href?: string
  /** A glyph for the tile. Marked `aria-hidden` by the list. */
  icon?: ReactNode
  id: string
  onSelect?: () => void
  subtitle?: ReactNode
  time?: ReactNode
  /** Rich text is fine — `<strong>` a name or a figure. */
  title: ReactNode
  /** `primary` by default. The tile's colour is the notification's status. */
  tone?: NotificationTone
  unread?: boolean
}

export interface NotificationLinkRenderProps {
  children: ReactNode
  className: string
  href: string
  item: NotificationItem
}

type HeadingLevel = 2 | 3 | 4 | 5 | 6

export interface NotificationListProps {
  className?: string
  /** Shown when there is nothing to list. */
  emptyState?: ReactNode
  /** A row under the list — a "Notification settings" link. */
  footer?: ReactNode
  /** Which heading the title is. `2` by default. */
  headingLevel?: HeadingLevel
  /** Replaces the default "mark all read" button with any control. */
  headerAction?: ReactNode
  items: NotificationItem[]
  /** The words of the default header button. `"Mark all read"` by default. */
  markAllReadLabel?: string
  /** Shows a "Mark all read" button while anything is unread. */
  onMarkAllRead?: () => void
  /** Draws a linked row with the app's router link. Without it a linked row is a plain `<a>`. */
  renderLink?: (props: NotificationLinkRenderProps) => ReactElement
  title?: ReactNode
  /** Overrides the count in the header badge. Defaults to the number of unread items. */
  unreadCount?: number
  /** Words for the header badge. `"3 new"` by default. */
  unreadCountLabel?: (count: number) => string
  /** What a screen reader hears for the unread dot. `"Unread"` by default. */
  unreadLabel?: string
}

const TILE_TONES: Record<NotificationTone, string> = {
  neutral: "bg-surface-sunken text-fg-subtle",
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
}

/*
 * The content of a notifications panel — header, list, optional footer — and
 * nothing that decides where the panel is. Put it in a `Popover` from a bell in
 * the top bar, or in a `SidePanel` on a phone; the list is the same in both.
 *
 * Each row is a tile whose colour is the notification's status, a rich title, a
 * subtitle, a time and an unread dot. Unread rows sit on a faint primary wash as
 * well as carrying the dot, so the difference does not rest on one small circle,
 * and the dot has words for a screen reader.
 */
export function NotificationList({
  className,
  emptyState = "You’re all caught up.",
  footer,
  headerAction,
  headingLevel = 2,
  items,
  markAllReadLabel = "Mark all read",
  onMarkAllRead,
  renderLink,
  title = "Notifications",
  unreadCount,
  unreadCountLabel = (count) => `${count} new`,
  unreadLabel = "Unread",
}: NotificationListProps) {
  const headingId = useId()
  const Heading = `h${headingLevel}` as const
  const unread = unreadCount ?? items.filter((item) => item.unread).length
  const action =
    headerAction ??
    (onMarkAllRead && unread > 0 ? (
      <Button size="sm" variant="ghost" onClick={onMarkAllRead}>
        {markAllReadLabel}
      </Button>
    ) : null)

  return (
    <section aria-labelledby={headingId} className={cn("grid", className)}>
      <div className="flex min-h-12 items-center gap-2 border-b border-edge py-1.5 pl-3 pr-1.5">
        <Heading id={headingId} className="m-0 text-[0.9375rem] font-semibold text-fg">
          {title}
        </Heading>
        {unread > 0 ? <Badge tone="warning">{unreadCountLabel(unread)}</Badge> : null}
        <span className="flex-1" />
        {action}
      </div>

      {items.length === 0 ? (
        <p className="m-0 px-3 py-8 text-center text-sm text-fg-muted">{emptyState}</p>
      ) : (
        <ul role="list" className="m-0 grid list-none gap-0.5 p-1.5">
          {items.map((item) => {
            const rowClassName = cn(
              "flex w-full gap-3 rounded-lg px-2.5 py-3 text-left no-underline",
              item.unread && "bg-primary-soft/50",
              (item.href || item.onSelect) &&
                "transition-colors duration-fast ease-standard hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring",
            )
            const content = (
              <>
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-md",
                    TILE_TONES[item.tone ?? "primary"],
                  )}
                >
                  {item.icon}
                </span>
                <span className="grid min-w-0 flex-1 gap-0.5">
                  <span className={cn("text-[0.8125rem] leading-snug", item.unread ? "text-fg" : "text-fg-muted")}>
                    {item.title}
                  </span>
                  {item.subtitle ? <span className="text-xs text-fg-subtle">{item.subtitle}</span> : null}
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1.5">
                  {item.time != null ? (
                    <span className="font-mono text-[0.6875rem] tabular-nums text-fg-subtle">
                      {item.dateTime ? <time dateTime={item.dateTime}>{item.time}</time> : item.time}
                    </span>
                  ) : null}
                  {item.unread ? (
                    <span className="size-2 rounded-full bg-warning">
                      <span className="sr-only">{unreadLabel}</span>
                    </span>
                  ) : null}
                </span>
              </>
            )

            return (
              <li key={item.id}>
                {item.href ? (
                  renderLink ? (
                    renderLink({ children: content, className: rowClassName, href: item.href, item })
                  ) : (
                    <a href={item.href} className={rowClassName} onClick={item.onSelect}>
                      {content}
                    </a>
                  )
                ) : item.onSelect ? (
                  <button type="button" className={rowClassName} onClick={item.onSelect}>
                    {content}
                  </button>
                ) : (
                  <div className={rowClassName}>{content}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {footer ? <div className="border-t border-edge p-1.5">{footer}</div> : null}
    </section>
  )
}
