"use client"

import { forwardRef } from "react"
import type { ButtonHTMLAttributes, ReactNode } from "react"
import { ArrowClockwise } from "../icons/index.js"
import { cn } from "../lib/cn.js"

type ButtonVariant = "primary" | "secondary" | "ghost" | "soft" | "danger"
type ButtonSize = "sm" | "md"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  /** What the pending state is called out loud. See PENDING_CONVENTION below. */
  loadingLabel?: string
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

/* PENDING_CONVENTION — how this package says "a write is running".
 *
 * Three parts, and every pending affordance in the package uses all three so a
 * screen reader is told something is happening rather than only hearing the
 * control go dim:
 *
 *   1. a spinning glyph, `aria-hidden`, for the sighted user;
 *   2. `aria-busy="true"` on the element that is busy;
 *   3. a `role="status"` node carrying `sr-only` text, mounted at the moment
 *      the work starts — `Spinner` is the same three parts standing alone.
 *
 * On a button the status node is rendered *after* the children, so the
 * accessible name gains a suffix ("Save Saving…") instead of being replaced.
 * The name is content-derived, so the suffix is the announcement for a user who
 * arrives at the control mid-write, and the live region is the announcement for
 * one who was already there. Follow this for any other pending surface
 * (skeletons included) rather than inventing a second convention. */
const DEFAULT_LOADING_LABEL = "Loading"

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-fg shadow-raised hover:bg-primary-hover focus-visible:ring-focus-ring",
  /* On surface-raised — the top of the ladder — so a secondary button reads as
   * a control on any of the four surfaces. On plain `surface` it was a white
   * rectangle on a white card. */
  secondary:
    "bg-surface-raised text-fg shadow-raised ring-1 ring-inset ring-edge hover:bg-surface-sunken hover:ring-edge-strong focus-visible:ring-focus-ring",
  ghost:
    "bg-transparent text-fg-muted hover:bg-primary-soft hover:text-fg focus-visible:ring-focus-ring",
  /* Ghost's hover tint, worn at rest. A ghost button reads as a run of text
   * until you point at it, so its padding looks like a bad indent when it sits
   * under copy it is supposed to line up with — a toast's action is the case
   * this exists for. The tint gives the padding something to belong to. Hover
   * moves the label rather than the fill, which is already there. */
  soft: "bg-primary-soft text-fg hover:text-primary focus-visible:ring-focus-ring",
  /* text-danger-fg, not text-primary-fg: the latter is the ink for PRIMARY, and
   * in dark mode it is a near-black green on a light red. */
  danger:
    "bg-danger text-danger-fg shadow-raised hover:opacity-90 focus-visible:ring-focus-ring",
}

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "min-h-9 gap-2 rounded-sm px-3 text-sm",
  md: "min-h-11 gap-2.5 rounded-md px-4 text-sm",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    children,
    disabled,
    leadingIcon,
    trailingIcon,
    loading = false,
    loadingLabel = DEFAULT_LOADING_LABEL,
    size = "md",
    type = "button",
    variant = "primary",
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap font-medium transition duration-normal ease-standard",
        "motion-reduce:transform-none motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:ring-4 active:scale-[0.98]",
        "disabled:cursor-not-allowed disabled:opacity-55",
        SIZE_STYLES[size],
        VARIANT_STYLES[variant],
        className,
      )}
      {...props}
    >
      {loading ? (
        <ArrowClockwise size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
      ) : (
        leadingIcon
      )}
      {children}
      {loading ? (
        <span role="status" className="sr-only">
          {loadingLabel}
        </span>
      ) : (
        trailingIcon
      )}
    </button>
  )
})

export interface IconButtonProps extends Omit<ButtonProps, "children"> {
  "aria-label": string
  icon: ReactNode
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { className, icon, size = "md", ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      size={size}
      className={cn(size === "sm" ? "w-9 px-0" : "w-11 px-0", className)}
      {...props}
    >
      {icon}
    </Button>
  )
})
