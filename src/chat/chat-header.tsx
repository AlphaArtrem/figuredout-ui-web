import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "../lib/cn.js"

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface ChatHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Controls on the right — icon buttons, a `DropdownMenu`. */
  actions?: ReactNode
  /** The picture of the other party. Pass it `aria-hidden` when the title already names them. */
  avatar?: ReactNode
  /** Which heading the title is. `2` by default; the look does not change. */
  headingLevel?: HeadingLevel
  /** Before the avatar: a back button on a phone, where the list is a screen away. */
  leading?: ReactNode
  /** A state that belongs to the title — a `Badge` saying the conversation is paused. */
  status?: ReactNode
  subtitle?: ReactNode
  title: ReactNode
}

export function ChatHeader({
  actions,
  avatar,
  className,
  headingLevel = 2,
  leading,
  status,
  subtitle,
  title,
  ...props
}: ChatHeaderProps) {
  const Heading = `h${headingLevel}` as const

  return (
    <header
      className={cn("flex min-h-16 items-center gap-3 border-b border-edge px-3 py-2.5 sm:px-5", className)}
      {...props}
    >
      {leading ? <div className="-ml-1 flex shrink-0 items-center">{leading}</div> : null}
      {avatar ? <div className="flex shrink-0 items-center">{avatar}</div> : null}
      <div className="grid min-w-0 flex-1 gap-0.5">
        {/* The status wraps under the title rather than squeezing it: a name cut
         * to "Pri…" beside a whole badge is the wrong way round. */}
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <Heading className="m-0 min-w-0 truncate text-[0.9375rem] font-semibold leading-tight text-fg">{title}</Heading>
          {status ? <div className="shrink-0">{status}</div> : null}
        </div>
        {subtitle ? <div className="flex min-w-0 items-center gap-1.5 truncate text-xs text-fg-subtle">{subtitle}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-1 sm:gap-2">{actions}</div> : null}
    </header>
  )
}
