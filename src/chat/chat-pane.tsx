import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "../lib/cn.js"

export interface ChatPaneProps extends HTMLAttributes<HTMLElement> {
  /** The main region — a `MessageList`, or an empty state. It gets all the height the header and footer leave. */
  children: ReactNode
  /** Pinned under the messages: a `Composer`, and any banner that belongs above it. */
  footer?: ReactNode
  /** Pinned over the messages, usually a `ChatHeader`. */
  header?: ReactNode
}

/*
 * The full-height frame of a conversation: header, a scrolling middle, footer.
 *
 * It fills its parent (`h-full`) and never grows past it, which is only true if
 * the parent has a BOUNDED height — `h-dvh`, a grid row, or a flex item that is
 * itself `min-h-0`. That is the whole contract and the whole trap. A flex item's
 * automatic minimum height is its content's height, so one un-`min-h-0`'d
 * ancestor anywhere between the viewport and this pane lets a long thread push
 * the page down instead of scrolling inside the list, and the composer scrolls
 * away with it. `min-h-0` on this element and on the middle slot is what lets the
 * list, not the page, take the overflow.
 *
 * The pane paints nothing: it sits on whatever surface its parent is, so the
 * same pane works as the page's middle column and inside a `SidePanel`.
 */
export function ChatPane({ children, className, footer, header, ...props }: ChatPaneProps) {
  return (
    <section className={cn("flex h-full min-h-0 min-w-0 flex-col", className)} {...props}>
      {header ? <div className="shrink-0">{header}</div> : null}
      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
      {footer ? (
        /* The bottom inset clears a phone's home indicator. It reads 0 on a
         * page without `viewport-fit=cover`, so the floor below still holds. */
        <div className="shrink-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-5 sm:pb-5">
          {footer}
        </div>
      ) : null}
    </section>
  )
}
