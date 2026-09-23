export interface ChartSeries {
  key: string
  label: string
  color?: string
}

export interface ChartTableColumn {
  header: string
  key: string
  align?: "left" | "right"
}

/**
 * A semantic tone for a meter or a bar that carries a status — passed, at risk,
 * failed. Status colours are reserved for status: a series that is merely one
 * of several categories takes `categoricalColor()` instead.
 */
export type { Tone as ChartTone } from "../lib/tone.js"
