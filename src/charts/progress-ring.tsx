import type { ReactNode } from "react"
import { cn } from "../lib/cn.js"
import { toneColor } from "../lib/tone.js"
import type { Tone } from "../lib/tone.js"
import { trackColor } from "./palette.js"
import { clampShare } from "./resolve-color.js"

const RING_SIZES = { sm: 36, md: 64, lg: 96 } as const

export interface ProgressRingProps {
  /** A short line under the centre figure — "of 500 leads". Shown from 56 px up; below that there is no room. */
  caption?: ReactNode
  className?: string
  /** Replaces the centre figure with a glyph — a check once a goal is met. */
  icon?: ReactNode
  /** What this is progress of — "Plan usage". The meter's accessible name. */
  label: string
  /** The limit or goal `value` counts toward. Defaults to 100. */
  max?: number
  /** `sm` 36 px (a table cell), `md` 64 px (a card), `lg` 96 px (a page's one figure), or a pixel size. */
  size?: keyof typeof RING_SIZES | number
  tone?: Tone
  value: number
  /** The centre text. Defaults to the share of `max` as a whole percentage, which may exceed 100%. */
  valueLabel?: ReactNode
  /** What a screen reader says for the value. Defaults to "`value` of `max`". */
  valueText?: string
}

/**
 * One value toward a limit or a goal: plan usage against its cap, setup steps
 * done, a score out of 100. **Only that.** A ring needs a denominator — a count
 * with no limit is a figure, not a ring — and one ring is one value: several
 * categories of one whole are a `StackedBar`, a comparison is `RankedBars`.
 *
 * The arc stops at full; the default label does not, because a value over its
 * limit is the fact the reader needs.
 */
export function ProgressRing({
  caption,
  className,
  icon,
  label,
  max = 100,
  size = "md",
  tone = "primary",
  value,
  valueLabel,
  valueText,
}: ProgressRingProps) {
  const px = typeof size === "number" ? size : RING_SIZES[size]
  /* Thin rings read as hairlines below 40 px, thick ones crowd the figure above it. */
  const stroke = px <= 40 ? 3.5 : Math.max(4, Math.round(px / 11))
  const radius = (px - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const share = clampShare(value, max)
  const percent = max > 0 ? Math.round((value / max) * 100) : 0
  const center = valueLabel ?? `${percent}%`
  /* A small ring has no caption and a short figure, so the figure can take more
   * of it; a long label ("1,250") steps down so it stays inside the track. */
  const long = typeof center === "string" && center.length > 4
  const color = toneColor(tone)

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText ?? `${value} of ${max}`}
      className={cn("relative inline-grid shrink-0 place-items-center", className)}
      style={{ width: px, height: px }}
    >
      <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`} aria-hidden="true" className="absolute inset-0">
        <circle cx={px / 2} cy={px / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={stroke} />
        {share > 0 ? (
          <circle
            cx={px / 2}
            cy={px / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${(share * circumference).toFixed(2)} ${circumference.toFixed(2)}`}
            transform={`rotate(-90 ${px / 2} ${px / 2})`}
            className="transition-[stroke-dasharray] duration-normal ease-standard motion-reduce:transition-none"
          />
        ) : null}
      </svg>
      <div className="relative flex flex-col items-center justify-center gap-px text-center">
        {icon ? (
          <span className="flex [&_svg]:size-[1em]" style={{ color, fontSize: Math.round(px * 0.34) }}>
            {icon}
          </span>
        ) : (
          <span
            className="font-mono font-semibold leading-none tracking-[-0.02em] tabular-nums text-fg"
            style={{ fontSize: Math.round(px * (long ? 0.2 : px <= 40 ? 0.3 : 0.24)) }}
          >
            {center}
          </span>
        )}
        {caption != null && px >= 56 ? (
          <span className="mt-0.5 max-w-[80%] text-[0.625rem] leading-tight text-fg-subtle">{caption}</span>
        ) : null}
      </div>
    </div>
  )
}
