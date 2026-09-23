import type { HTMLAttributes, ReactNode } from "react"
import { Check, Checks, Clock, WarningCircle } from "../icons/index.js"
import { cn } from "../lib/cn.js"

export type MessageBubbleVariant = "incoming" | "outgoing" | "assistant"
export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed"
/** Where a bubble sits in a run of consecutive messages from the same side. */
export type MessageGroupPosition = "single" | "first" | "middle" | "last"

export interface MessageBubbleProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children: ReactNode
  /** Machine-readable form of `time`. When set, `time` renders inside a `<time>`. */
  dateTime?: string
  /** `single` by default. See the radii note below. */
  groupPosition?: MessageGroupPosition
  /** Who or what sent it, in the meta line — "You", "Assistant", a name. */
  label?: ReactNode
  /** A small glyph before `label`. Mark it `aria-hidden`; the label says it in words. */
  labelIcon?: ReactNode
  /** Anything else for the meta line after the time — a reply latency, "edited". */
  meta?: ReactNode
  /** Delivery state, drawn as a tick after the time. Only meaningful on outgoing and assistant messages. */
  status?: MessageStatus
  /** Words for each status. The tick is a picture; these are what a screen reader hears. */
  statusLabels?: Partial<Record<MessageStatus, string>>
  time?: ReactNode
  /** `incoming` by default. */
  variant?: MessageBubbleVariant
}

const DEFAULT_STATUS_LABELS: Record<MessageStatus, string> = {
  sending: "Sending",
  sent: "Sent",
  delivered: "Delivered",
  read: "Read",
  failed: "Not delivered",
}

/* Three voices, and the side a bubble sits on is who is speaking.
 *
 * - incoming: the other party. The lifted surface with a hairline, so it reads
 *   on `bg` and on `surface` alike.
 * - outgoing: a person on this side. The primary wash.
 * - assistant: outgoing, but written by the product rather than a person. Same
 *   side as outgoing, a solid, deeper wash of the same hue (`chat-assistant`),
 *   so a reader scanning a handed-over conversation can see where the person
 *   took over without reading the meta lines. */
const VARIANT_STYLES: Record<MessageBubbleVariant, string> = {
  incoming: "bg-surface-raised ring-1 ring-inset ring-edge",
  outgoing: "bg-primary-soft",
  assistant: "bg-chat-assistant",
}

/* Grouping radii. Every bubble is fully rounded except its TAIL corner — the
 * bottom corner on the speaker's side — which is tight so the bubble points at
 * whoever sent it. In a run of bubbles from one side, the corners where two
 * bubbles meet are tight too, so the run reads as one block with a single tail
 * at its end: the first loses its bottom corner, the middle both, the last its
 * top (and keeps its tail). */
function bubbleRadius(side: "start" | "end", position: MessageGroupPosition) {
  const joinsAbove = position === "middle" || position === "last"
  if (side === "start") {
    return cn("rounded-xl rounded-bl-[calc(var(--radius-sm)/2)]", joinsAbove && "rounded-tl-[calc(var(--radius-sm)/2)]")
  }
  return cn("rounded-xl rounded-br-[calc(var(--radius-sm)/2)]", joinsAbove && "rounded-tr-[calc(var(--radius-sm)/2)]")
}

function StatusTick({ label, status }: { label: string; status: MessageStatus }) {
  const glyph =
    status === "sending" ? (
      <Clock size={12} aria-hidden="true" />
    ) : status === "sent" ? (
      <Check size={12} weight="bold" aria-hidden="true" />
    ) : status === "failed" ? (
      <WarningCircle size={12} weight="bold" aria-hidden="true" />
    ) : (
      <Checks size={12} weight="bold" aria-hidden="true" />
    )

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        status === "read" && "text-primary",
        status === "failed" && "text-danger",
      )}
    >
      {glyph}
      {/* A failure is the one status worth reading at a glance, so it prints its
       * words; the rest keep them for assistive tech only. */}
      <span className={status === "failed" ? undefined : "sr-only"}>{label}</span>
    </span>
  )
}

export function MessageBubble({
  children,
  className,
  dateTime,
  groupPosition = "single",
  label,
  labelIcon,
  meta,
  status,
  statusLabels,
  time,
  variant = "incoming",
  ...props
}: MessageBubbleProps) {
  const side = variant === "incoming" ? "start" : "end"
  const statusLabel = status ? (statusLabels?.[status] ?? DEFAULT_STATUS_LABELS[status]) : undefined
  const timeNode = time != null && dateTime ? <time dateTime={dateTime}>{time}</time> : time
  /* The separators are drawn between whichever parts are present, so a bubble
   * with only a time has no stray dot in front of it. */
  const metaParts = [
    label != null ? (
      <span key="label" className={cn("inline-flex items-center gap-1", variant === "assistant" && "text-primary")}>
        {labelIcon}
        {label}
      </span>
    ) : null,
    timeNode != null ? <span key="time">{timeNode}</span> : null,
    meta != null ? <span key="meta">{meta}</span> : null,
  ].filter(Boolean)
  const hasMetaLine = metaParts.length > 0 || status !== undefined

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1",
        side === "end" ? "items-end" : "items-start",
        /* Pulls a continuing bubble up to 4px under the one before it. It
         * assumes the 12px gap `MessageList` puts between its children. */
        (groupPosition === "middle" || groupPosition === "last") && "-mt-2",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          /* `pre-wrap` keeps the sender's own line breaks; `break-words` stops
           * a pasted URL from pushing the bubble past its max width. */
          "max-w-[85%] whitespace-pre-wrap break-words px-3.5 py-2.5 text-sm leading-relaxed text-fg [text-wrap:pretty] sm:max-w-[72%]",
          bubbleRadius(side, groupPosition),
          VARIANT_STYLES[variant],
        )}
      >
        {children}
      </div>
      {hasMetaLine ? (
        <div className="flex flex-wrap items-center gap-x-1.5 font-mono text-[0.6875rem] tabular-nums text-fg-subtle">
          {metaParts.map((part, index) => (
            <span key={index} className="inline-flex items-center gap-1.5">
              {index > 0 ? <span aria-hidden="true">·</span> : null}
              {part}
            </span>
          ))}
          {status && statusLabel ? <StatusTick status={status} label={statusLabel} /> : null}
        </div>
      ) : null}
    </div>
  )
}
