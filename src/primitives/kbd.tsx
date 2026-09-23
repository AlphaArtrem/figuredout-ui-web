import type { HTMLAttributes } from "react"
import { cn } from "../lib/cn.js"

export interface KbdProps extends HTMLAttributes<HTMLElement> {}

/* A key the reader presses, not a value the product reports — so it is mono
 * like a figure but hairlined like a control, and sits on no surface of its
 * own: it borrows whatever it is written on, the way a keycap in a sentence
 * should. The radius is a fraction of `--radius-sm` because a full 8px on a
 * 20px-tall cap turns it into a pill, which reads as a badge. */
export function Kbd({ className, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex min-w-5 items-center justify-center whitespace-nowrap rounded-[calc(var(--radius-sm)*0.625)] px-1.5 py-0.5",
        "font-mono text-[0.6875rem] font-medium leading-none text-fg-muted ring-1 ring-inset ring-edge-strong",
        className,
      )}
      {...props}
    />
  )
}
