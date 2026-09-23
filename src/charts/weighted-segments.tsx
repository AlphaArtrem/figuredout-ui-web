import { cn } from "../lib/cn.js"
import { toneColor } from "../lib/tone.js"
import type { Tone } from "../lib/tone.js"
import { clampShare } from "./resolve-color.js"

export interface WeightedSegment {
  key: string
  label: string
  /** What was earned, out of `weight`. */
  value: number
  /** The segment's share of the strip, and its maximum. */
  weight: number
}

export interface WeightedSegmentsProps {
  className?: string
  /** Names the breakdown for a screen reader — "Match score by criterion". */
  label: string
  segments: WeightedSegment[]
  /** Prints each segment's label and "value/weight" under the strip. Defaults to true; off, they stay in the page visually hidden. */
  showLabels?: boolean
  /**
   * How the unearned part of a segment is drawn. `warning` (the default) hatches
   * it in the warning hue and colours its figure, for a total where every point
   * missed is worth a look; `neutral` leaves it as plain track.
   */
  shortfall?: "warning" | "neutral"
  /** The earned fill. Defaults to success. */
  tone?: Tone
}

/* Hatching rather than a flat wash, so "missed" does not depend on telling two
 * hues apart. The stripe is the warning token itself at half strength. */
const HATCH = "repeating-linear-gradient(135deg, var(--color-warning) 0 3px, transparent 3px 7px)"

/**
 * A total built from weighted parts — a score out of 100 made of criteria worth
 * 40, 30, 20 and 10. Each segment's width is its weight; its fill is what was
 * earned of it. Reads both "which parts matter most" and "where the points were
 * lost" from one strip.
 */
export function WeightedSegments({
  className,
  label,
  segments,
  showLabels = true,
  shortfall = "warning",
  tone = "success",
}: WeightedSegmentsProps) {
  const fill = toneColor(tone)
  const visible = segments.filter((segment) => segment.weight > 0)

  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <div aria-hidden="true" className="flex h-[1.125rem] gap-1">
        {visible.map((segment) => {
          const share = clampShare(segment.value, segment.weight)
          const short = share < 1 && shortfall === "warning"
          return (
            <span
              key={segment.key}
              className={cn("flex min-w-0 overflow-hidden rounded-[0.3125rem]", short ? "bg-warning-soft" : "bg-chart-track")}
              style={{ flex: `${segment.weight} 1 0%` }}
            >
              <span
                className="block h-full transition-[width] duration-normal ease-standard motion-reduce:transition-none"
                style={{ width: `${share * 100}%`, backgroundColor: fill }}
              />
              {short ? <span className="block flex-1 opacity-50" style={{ backgroundImage: HATCH }} /> : null}
            </span>
          )
        })}
      </div>
      <ul aria-label={label} className={cn("m-0 flex list-none gap-1 p-0", !showLabels && "sr-only")}>
        {visible.map((segment) => {
          const short = segment.value < segment.weight
          return (
            <li
              key={segment.key}
              className="flex min-w-0 flex-col gap-px text-[0.6875rem] text-fg-subtle"
              style={{ flex: `${segment.weight} 1 0%` }}
            >
              <span className="truncate" title={segment.label}>
                {segment.label}
              </span>
              <span
                className={cn(
                  "font-mono font-semibold tabular-nums",
                  !short ? "text-fg" : shortfall === "warning" ? "text-warning" : "text-fg-subtle",
                )}
              >
                <span aria-hidden="true">
                  {segment.value}/{segment.weight}
                </span>
                <span className="sr-only">
                  {segment.value} of {segment.weight}
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
