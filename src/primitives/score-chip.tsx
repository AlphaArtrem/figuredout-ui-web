import type { HTMLAttributes } from "react"
import { cn } from "../lib/cn.js"
import { TONE_CHIP_CLASSES } from "../lib/tone.js"
import type { Tone } from "../lib/tone.js"

export interface ScoreChipThresholds {
  /** At or above this, the score is success. */
  success: number
  /** At or above this (and below `success`), the score is warning. Below it, danger. */
  warning: number
}

export interface ScoreChipProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** What a screen reader says for a missing score, which is drawn as a dash. Defaults to "No score". */
  missingLabel?: string
  /** Defaults to success from 75, warning from 60, danger below. */
  thresholds?: ScoreChipThresholds
  /** `null`, `undefined` or `NaN` is a score that does not exist yet — a muted dash, not a zero. */
  value: number | null | undefined
  valueFormatter?: (value: number) => string
}

const DEFAULT_THRESHOLDS: ScoreChipThresholds = { success: 75, warning: 60 }

export function scoreTone(value: number, thresholds: ScoreChipThresholds = DEFAULT_THRESHOLDS): Tone {
  if (value >= thresholds.success) return "success"
  if (value >= thresholds.warning) return "warning"
  return "danger"
}

/**
 * A score as a mono figure in a tinted chip, its tone taken from thresholds —
 * for a score in a table column or a list row, where a ring would be
 * decoration. The chip has a minimum width so a column of them lines up.
 * Wash, ink and ring are `Badge`'s, so a score beside a status reads as one system.
 */
export function ScoreChip({
  className,
  missingLabel = "No score",
  thresholds = DEFAULT_THRESHOLDS,
  value,
  valueFormatter = (next) => String(Math.round(next)),
  ...props
}: ScoreChipProps) {
  const has = typeof value === "number" && Number.isFinite(value)
  const tone: Tone = has ? scoreTone(value, thresholds) : "neutral"
  return (
    <span
      className={cn(
        "inline-grid h-[1.625rem] min-w-[2.375rem] place-items-center whitespace-nowrap rounded-md px-1.5 font-mono text-[0.8125rem] font-semibold tabular-nums ring-1 ring-inset",
        TONE_CHIP_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {has ? (
        valueFormatter(value)
      ) : (
        <>
          <span aria-hidden="true">—</span>
          <span className="sr-only">{missingLabel}</span>
        </>
      )}
    </span>
  )
}
