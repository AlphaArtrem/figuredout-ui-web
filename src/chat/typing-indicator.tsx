import type { HTMLAttributes } from "react"
import { cn } from "../lib/cn.js"
import type { MessageBubbleVariant } from "./message-bubble.js"

export interface TypingIndicatorProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** What a screen reader hears — "Typing", "Assistant is replying". */
  label?: string
  /** Which side is typing, matching the bubble it will become. `incoming` by default. */
  variant?: MessageBubbleVariant
}

const VARIANT_STYLES: Record<MessageBubbleVariant, string> = {
  incoming: "bg-surface-raised ring-1 ring-inset ring-edge text-fg-subtle",
  outgoing: "bg-primary-soft text-primary",
  assistant: "bg-chat-assistant text-primary",
}

/* Each dot's delay is a multiple of `--motion-fast`, so the stagger follows the
 * motion tokens rather than a number of its own. Under reduced motion the
 * animation is off and each dot holds its own static opacity — a fading row of
 * three dots still says "more is coming" without moving. */
const DOTS = [
  "opacity-100 [animation-delay:0ms]",
  "opacity-60 [animation-delay:var(--motion-fast)]",
  "opacity-30 [animation-delay:calc(var(--motion-fast)*2)]",
] as const

/*
 * Put it inside a `MessageList`: the list is a polite live region, so the
 * indicator's words are announced when it appears. Outside one it is silent by
 * design — a live region of its own inside the log would announce twice.
 */
export function TypingIndicator({ className, label = "Typing", variant = "incoming", ...props }: TypingIndicatorProps) {
  const side = variant === "incoming" ? "start" : "end"
  return (
    <div className={cn("flex", side === "end" ? "justify-end" : "justify-start", className)} {...props}>
      <div
        className={cn(
          "inline-flex items-center gap-1 px-3.5 py-3",
          side === "end"
            ? "rounded-xl rounded-br-[calc(var(--radius-sm)/2)]"
            : "rounded-xl rounded-bl-[calc(var(--radius-sm)/2)]",
          VARIANT_STYLES[variant],
        )}
      >
        {DOTS.map((dot) => (
          <span
            key={dot}
            aria-hidden="true"
            className={cn("block size-1.5 rounded-full bg-current motion-safe:animate-typing-dot", dot)}
          />
        ))}
        <span className="sr-only">{label}</span>
      </div>
    </div>
  )
}
