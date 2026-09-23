import { toneColor } from "../lib/tone.js"
import type { Tone } from "../lib/tone.js"
import { categoricalColor } from "./palette.js"

/* Not exported from the barrel. One rule for every chart part that takes
 * either a colour or a tone: an explicit colour wins, then a tone, then the
 * categorical palette in order — so a legend and the bar it explains can never
 * resolve the same entry to two different colours. */
export function resolveColor(entry: { color?: string | undefined; tone?: Tone | undefined }, index: number): string {
  if (entry.color) return entry.color
  if (entry.tone) return toneColor(entry.tone)
  return categoricalColor(index)
}

export function clampShare(value: number, max: number): number {
  if (!(max > 0) || !Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value / max))
}
