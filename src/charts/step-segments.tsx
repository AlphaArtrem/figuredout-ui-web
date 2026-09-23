import { cn } from "../lib/cn.js"
import { toneColor } from "../lib/tone.js"
import type { Tone } from "../lib/tone.js"

export interface StepSegmentsProps {
  className?: string
  /** What is being counted — "Required fields collected". The meter's accessible name. */
  label: string
  /** Prints "value/total" beside the segments. Defaults to true. */
  showCount?: boolean
  size?: "sm" | "md"
  /**
   * `auto` (the default) is success once every step is done and warning until
   * then — the reading "n of total" is almost always asked for: is it finished?
   */
  tone?: Tone | "auto"
  total: number
  value: number
}

const SEGMENT_SIZE = {
  sm: "h-2.5 w-1.5",
  md: "h-3 w-2",
} as const

/**
 * "n of total" as a row of small segments, one per step — for a count of
 * discrete things out of a small known total (roughly a dozen or fewer), in a
 * table cell or beside a name. A continuous share is a `ProgressRing`.
 */
export function StepSegments({
  className,
  label,
  showCount = true,
  size = "md",
  tone = "auto",
  total,
  value,
}: StepSegmentsProps) {
  const steps = Math.max(0, Math.floor(total))
  const done = Math.min(steps, Math.max(0, Math.floor(value)))
  const resolved: Tone = tone === "auto" ? (steps > 0 && done >= steps ? "success" : "warning") : tone
  const fill = toneColor(resolved)

  return (
    <span
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={steps}
      aria-valuenow={done}
      aria-valuetext={`${done} of ${steps}`}
      className={cn("inline-flex items-center gap-2", className)}
    >
      <span aria-hidden="true" className="inline-flex gap-0.5">
        {Array.from({ length: steps }, (_, index) => (
          <span
            key={index}
            className={cn("block rounded-[0.125rem]", SEGMENT_SIZE[size], index >= done && "bg-chart-track")}
            style={index < done ? { backgroundColor: fill } : undefined}
          />
        ))}
      </span>
      {showCount ? (
        <span aria-hidden="true" className="font-mono text-xs tabular-nums text-fg-muted">
          {done}/{steps}
        </span>
      ) : null}
    </span>
  )
}
