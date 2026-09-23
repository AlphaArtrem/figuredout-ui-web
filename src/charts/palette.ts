const CATEGORICAL_TOKENS = [
  "var(--chart-cat-1)",
  "var(--chart-cat-2)",
  "var(--chart-cat-3)",
  "var(--chart-cat-4)",
  "var(--chart-cat-5)",
  "var(--chart-cat-6)",
] as const

export function categoricalColor(index: number): string {
  return CATEGORICAL_TOKENS[index % CATEGORICAL_TOKENS.length] as string
}

export const sequentialColor = "var(--chart-seq)"
export const gridColor = "var(--chart-grid)"
export const axisLabelColor = "var(--chart-axis-label)"
/** The unfilled part of a meter: a ring's track, an empty step. */
export const trackColor = "var(--chart-track)"

export { toneColor } from "../lib/tone.js"
