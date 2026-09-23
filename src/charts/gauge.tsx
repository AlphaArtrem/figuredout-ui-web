import type { ReactNode } from "react"
import { cn } from "../lib/cn.js"
import { toneColor } from "../lib/tone.js"
import type { Tone } from "../lib/tone.js"
import { trackColor } from "./palette.js"
import { clampShare } from "./resolve-color.js"

export interface GaugeProps {
  /** A short line under the figure — "health score". */
  caption?: ReactNode
  className?: string
  /** The gauge's accessible name. */
  label: string
  /** A reference point on the same scale — a target, last period's value. Drawn as a tick across the track. */
  marker?: number
  /** What the marker is, for a screen reader. Defaults to "target". */
  markerLabel?: string
  max?: number
  /** Width in pixels; the height follows. Defaults to 200. The gauge never grows past its container. */
  size?: number
  tone?: Tone
  value: number
  /** Formats the centre figure and the spoken value. */
  valueFormatter?: (value: number) => string
}

/* Room around the arc for the marker's tick, which reaches past the track. */
const PAD = 4

/**
 * A value on a bounded scale, as a half circle with the figure under it. For
 * one reading against a known range — a score, a utilisation — where where it
 * sits on the scale is the point. Progress toward a goal is a `ProgressRing`.
 */
export function Gauge({
  caption,
  className,
  label,
  marker,
  markerLabel = "target",
  max = 100,
  size = 200,
  tone = "primary",
  value,
  valueFormatter = (next) => String(next),
}: GaugeProps) {
  const stroke = Math.max(8, Math.round(size * 0.075))
  const radius = (size - stroke - PAD * 2) / 2
  const height = radius + stroke + PAD
  const cx = size / 2
  const cy = height - stroke / 2
  const arc = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`
  const length = Math.PI * radius
  const share = clampShare(value, max)

  let tick: { x1: number; y1: number; x2: number; y2: number } | null = null
  if (marker != null) {
    const angle = Math.PI * (1 - clampShare(marker, max))
    const inner = radius - stroke / 2 - 3
    const outer = radius + stroke / 2 + 3
    tick = {
      x1: cx + inner * Math.cos(angle),
      y1: cy - inner * Math.sin(angle),
      x2: cx + outer * Math.cos(angle),
      y2: cy - outer * Math.sin(angle),
    }
  }

  const spoken = `${valueFormatter(value)} of ${valueFormatter(max)}${
    marker != null ? `, ${markerLabel} ${valueFormatter(marker)}` : ""
  }`

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={spoken}
      className={cn("relative max-w-full shrink-0", className)}
      style={{ width: size }}
    >
      <svg viewBox={`0 0 ${size} ${height}`} aria-hidden="true" className="block h-auto w-full">
        <path d={arc} fill="none" stroke={trackColor} strokeWidth={stroke} strokeLinecap="round" />
        {share > 0 ? (
          <path
            d={arc}
            fill="none"
            stroke={toneColor(tone)}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${(share * length).toFixed(2)} ${length.toFixed(2)}`}
            className="transition-[stroke-dasharray] duration-normal ease-standard motion-reduce:transition-none"
          />
        ) : null}
        {tick ? (
          <line {...tick} stroke="var(--color-fg)" strokeWidth={2} strokeLinecap="round" />
        ) : null}
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-0.5 text-center">
        <span
          className="font-mono font-semibold leading-none tracking-[-0.02em] tabular-nums text-fg"
          style={{ fontSize: Math.round(size * 0.18) }}
        >
          {valueFormatter(value)}
        </span>
        {caption != null ? <span className="text-xs text-fg-subtle">{caption}</span> : null}
      </div>
    </div>
  )
}
