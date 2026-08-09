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

const TONE_STYLES: Record<CardTone, string> = {
  neutral: "",
  info: "ring-info/30",
  warning: "ring-warning/35",
  danger: "ring-danger/35",
  success: "ring-success/35",
}

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
        "rounded-lg bg-surface p-1 shadow-raised ring-1 ring-inset ring-edge transition duration-normal ease-standard",
        hoverable && "hover:shadow-hover hover:ring-edge-strong",
        TONE_STYLES[tone],
        className,
      )}
      {...props}
    >
      {hasSummary ? (
        <div className="flex items-start justify-between gap-4 rounded-md bg-surface-raised px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            {logo ?? icon ? <div className="mt-0.5 shrink-0 text-fg-subtle">{logo ?? icon}</div> : null}
            <div className="grid min-w-0 gap-1">
              {number ? <div className="text-xs font-bold uppercase tracking-normal text-fg-subtle">{number}</div> : null}
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
  return (
    <div
      ref={ref}
      className={cn("rounded-md bg-surface-raised px-5 py-4", className)}
      {...props}
    />
  )
})

export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardBody(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn("px-5 py-4", className)} {...props} />
})

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardFooter(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn("border-t border-edge px-5 py-4", className)}
      {...props}
    />
  )
})
