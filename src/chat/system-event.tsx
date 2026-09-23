import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "../lib/cn.js"

export type SystemEventTone = "neutral" | "primary" | "success" | "warning" | "danger" | "info"

export interface SystemEventProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children: ReactNode
  /** A glyph before the text. Mark it `aria-hidden`. */
  icon?: ReactNode
  /** `neutral` by default. The tone is the status of the event, not decoration. */
  tone?: SystemEventTone
}

/* The Badge palette, for the same reason: the ring is the tone's own hue, so the
 * pill reads as one object. It is not a Badge because a Badge is one short thing
 * and never wraps, and an event line ("Handed over · the assistant is paused")
 * occasionally has to on a phone. */
const TONE_STYLES: Record<SystemEventTone, string> = {
  neutral: "bg-surface-sunken text-fg-muted ring-edge",
  primary: "bg-primary-soft text-primary ring-primary/30",
  success: "bg-success-soft text-success ring-success/30",
  warning: "bg-warning-soft text-warning ring-warning/30",
  danger: "bg-danger-soft text-danger ring-danger/30",
  info: "bg-info-soft text-info ring-info/30",
}

/** Something that happened to the conversation rather than a message in it — centred, owned by nobody. */
export function SystemEvent({ children, className, icon, tone = "neutral", ...props }: SystemEventProps) {
  return (
    <div className={cn("flex justify-center px-2", className)} {...props}>
      <p
        className={cn(
          "m-0 inline-flex max-w-full items-center gap-2 rounded-xl px-3 py-1.5 text-center text-xs font-medium ring-1 ring-inset",
          TONE_STYLES[tone],
        )}
      >
        {icon ? <span className="flex shrink-0">{icon}</span> : null}
        <span className="min-w-0">{children}</span>
      </p>
    </div>
  )
}

export interface DayDividerProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children: ReactNode
  /** Machine-readable date. When set, the label renders inside a `<time>`. */
  dateTime?: string
}

/* A mono uppercase caption, because it names the value the messages below it
 * share. The two rules are decoration and are hidden; the words are read. */
export function DayDivider({ children, className, dateTime, ...props }: DayDividerProps) {
  return (
    <div className={cn("flex items-center gap-3 py-1", className)} {...props}>
      <span aria-hidden="true" className="h-px flex-1 bg-edge" />
      <span className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-fg-subtle">
        {dateTime ? <time dateTime={dateTime}>{children}</time> : children}
      </span>
      <span aria-hidden="true" className="h-px flex-1 bg-edge" />
    </div>
  )
}
