"use client"

import { useRef } from "react"
import type { KeyboardEvent, ReactNode } from "react"
import { cn } from "../lib/cn.js"

export interface SegmentedControlOption {
  /** A figure after the label — how many items the segment holds. Rendered as a mono tabular figure. */
  count?: ReactNode
  disabled?: boolean
  /** A glyph before the label. Mark it `aria-hidden`. */
  icon?: ReactNode
  label: ReactNode
  value: string
}

export interface SegmentedControlProps {
  className?: string
  /** Stretch across the container, segments sharing the width equally. */
  fullWidth?: boolean
  /** Names the control — "Conversation filter". Required: a row of "All / Open / Closed" means nothing on its own. */
  label: string
  onValueChange: (value: string) => void
  options: SegmentedControlOption[]
  /**
   * `radio` (the default) for a single choice that changes what is shown — the
   * control is a `radiogroup`, one Tab stop, arrows move and select. `pressed` for
   * a row of toggle buttons (`aria-pressed`), each its own Tab stop, where arrows
   * only move focus. Use `radio` unless the segments are genuinely separate
   * buttons.
   */
  semantics?: "radio" | "pressed"
  /** `md` (40px) by default; `sm` (32px) for a dense toolbar. */
  size?: "sm" | "md"
  value: string
}

const SIZE_STYLES = {
  sm: "min-h-8 px-3 text-[0.8125rem]",
  md: "min-h-10 px-3.5 text-sm",
} as const

/*
 * A single choice between a few peers, drawn as the `Tabs` track: the track is a
 * hole (`surface-sunken`) and the chosen segment is lifted out of it. It is the
 * same idiom as `Tabs` without the panel — use `Tabs` when each choice owns a
 * panel of content, and this when the choice filters or switches something that
 * lives elsewhere (a list below, a chart's range).
 */
export function SegmentedControl({
  className,
  fullWidth = false,
  label,
  onValueChange,
  options,
  semantics = "radio",
  size = "md",
  value,
}: SegmentedControlProps) {
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([])
  const enabled = options.filter((option) => !option.disabled)
  const isRadio = semantics === "radio"
  /* The Tab stop in a radiogroup is the checked segment, or the first enabled
   * one when nothing is checked, so the group is always reachable. */
  const tabStop = options.some((option) => option.value === value && !option.disabled) ? value : enabled[0]?.value

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, current: SegmentedControlOption) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key) || enabled.length === 0) {
      return
    }
    event.preventDefault()
    const index = enabled.findIndex((option) => option.value === current.value)
    const last = enabled.length - 1
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? last
          : event.key === "ArrowRight" || event.key === "ArrowDown"
            ? index >= last
              ? 0
              : index + 1
            : index <= 0
              ? last
              : index - 1
    const next = enabled[nextIndex]
    if (!next) {
      return
    }
    buttonsRef.current[options.indexOf(next)]?.focus()
    /* A radio group selects as it moves — that is what arrowing through radios
     * does everywhere else. Toggle buttons only move. */
    if (isRadio) {
      onValueChange(next.value)
    }
  }

  return (
    <div
      role={isRadio ? "radiogroup" : "group"}
      aria-label={label}
      className={cn(
        "min-w-0 max-w-full gap-1 rounded-lg bg-surface-sunken p-1 ring-1 ring-inset ring-edge",
        fullWidth ? "flex w-full" : "inline-flex",
        className,
      )}
    >
      {options.map((option, index) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            ref={(element) => {
              buttonsRef.current[index] = element
            }}
            type="button"
            role={isRadio ? "radio" : undefined}
            aria-checked={isRadio ? selected : undefined}
            aria-pressed={isRadio ? undefined : selected}
            tabIndex={isRadio ? (option.value === tabStop ? 0 : -1) : undefined}
            disabled={option.disabled}
            className={cn(
              "inline-flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md transition duration-fast ease-standard",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring",
              SIZE_STYLES[size],
              fullWidth && "flex-1",
              selected
                ? "bg-surface-raised font-semibold text-fg shadow-raised ring-1 ring-inset ring-edge"
                : "font-medium text-fg-muted hover:text-fg",
              option.disabled && "cursor-not-allowed opacity-45 hover:text-fg-muted",
            )}
            onClick={() => onValueChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, option)}
          >
            {option.icon ? <span className="flex shrink-0">{option.icon}</span> : null}
            <span className="truncate">{option.label}</span>
            {option.count != null ? (
              <span className={cn("font-mono text-[0.75em] tabular-nums", selected ? "text-fg-muted" : "text-fg-subtle")}>
                {option.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
