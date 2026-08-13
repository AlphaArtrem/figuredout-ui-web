import { forwardRef } from "react"
import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "../lib/cn.js"

type CardTone = "neutral" | "info" | "warning" | "danger" | "success"

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  accessory?: ReactNode
  description?: ReactNode
  hoverable?: boolean
  icon?: ReactNode
  logo?: ReactNode
  number?: ReactNode
  title?: ReactNode
  tone?: CardTone
}

/* Tone is a bar on the leading edge, drawn as a LEFT BORDER on a full-size
 * overlay rather than as a 4px block. A border follows the border radius, so it
 * tapers into the corners and meets the ring on the curve; a block gets clipped
 * by the corner and reads as a bar that stops short of the edge.
 *
 * It has to be an overlay at all — rather than a border on the card itself —
 * because the header and footer paint their own full-bleed surfaces over the
 * card's background, and an inset ring or shadow sits underneath those. */
const TONE_STYLES: Record<CardTone, string> = {
  neutral: "",
  info: "before:border-info after:ring-info/40",
  warning: "before:border-warning after:ring-warning/40",
  danger: "before:border-danger after:ring-danger/40",
  success: "before:border-success after:ring-success/40",
}

const TONE_BAR =
  "before:pointer-events-none before:absolute before:inset-0 before:z-[3] before:rounded-[inherit] before:border-l-4 before:border-transparent before:content-['']"

/* The hairline, as an overlay for the same reason. Every container in the
 * package with a banded interior — Card, Section, Dialog, SidePanel, the table
 * frame — uses this, which is why they all read as the same object. */
const RING_OVERLAY =
  "after:pointer-events-none after:absolute after:inset-0 after:z-[2] after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-edge after:content-['']"

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    accessory,
    children,
    className,
    description,
    hoverable = false,
    icon,
    logo,
    number,
    title,
    tone = "neutral",
    ...props
  },
  ref,
) {
  const hasSummary = icon || logo || number || title || description || accessory

  return (
    <div
      ref={ref}
      className={cn(
        /* Two surfaces, one object. The package used to pad the shell by 1px
         * and float a raised summary inside it — a card inside a card. */
        "relative flex min-w-0 flex-col overflow-hidden rounded-xl bg-surface shadow-raised transition duration-normal ease-standard",
        RING_OVERLAY,
        TONE_BAR,
        hoverable && "hover:-translate-y-0.5 hover:shadow-hover hover:after:ring-edge-strong motion-reduce:transform-none",
        TONE_STYLES[tone],
        className,
      )}
      {...props}
    >
      {hasSummary ? (
        <div className="flex items-start justify-between gap-4 border-b border-edge bg-surface-raised px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            {logo ?? icon ? <div className="mt-0.5 shrink-0 text-fg-subtle">{logo ?? icon}</div> : null}
            <div className="grid min-w-0 gap-1">
              {number ? (
                <div className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-fg-subtle">{number}</div>
              ) : null}
              {title ? <div className="text-sm font-semibold text-fg">{title}</div> : null}
              {description ? <div className="text-sm text-fg-muted">{description}</div> : null}
            </div>
          </div>
          {accessory ? <div className="shrink-0">{accessory}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  )
})

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardHeader(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn("border-b border-edge bg-surface-raised px-5 py-4", className)} {...props} />
})

/* Grows, so a footer sits on the bottom edge when a grid stretches one card to
 * match a taller neighbour instead of floating halfway down it. */
export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardBody(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn("flex-1 px-5 py-4", className)} {...props} />
})

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardFooter(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn("flex flex-wrap items-center gap-3 border-t border-edge bg-surface-sunken px-5 py-3", className)}
      {...props}
    />
  )
})
