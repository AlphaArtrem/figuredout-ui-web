/**
 * The six semantic tones every toned component shares — `Badge`, `StatCard`,
 * `ScoreChip` and the chart meters. One list, so a tone added here is a tone
 * every component can take, and a tone name means the same colour everywhere.
 */
export type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info"

/* The ring is the tone's own hue, not neutral --color-edge: a success badge
 * should read as one object, not as a green fill inside a grey outline.
 * Shared by `Badge` and `ScoreChip`, so a score chip and a status badge in the
 * same table row are the same wash, ink and ring. */
export const TONE_CHIP_CLASSES: Record<Tone, string> = {
  neutral: "bg-surface-sunken text-fg-muted ring-edge",
  primary: "bg-primary-soft text-primary ring-primary/30",
  success: "bg-success-soft text-success ring-success/30",
  warning: "bg-warning-soft text-warning ring-warning/30",
  danger: "bg-danger-soft text-danger ring-danger/30",
  info: "bg-info-soft text-info ring-info/30",
}

/* A tone as a CSS colour, for fills and strokes that cannot take a class — an
 * SVG arc, a bar whose width is computed. Neutral is the subtle ink rather
 * than the edge: a neutral fill still has to read against the track. */
const TONE_COLORS: Record<Tone, string> = {
  neutral: "var(--color-fg-subtle)",
  primary: "var(--color-primary)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  info: "var(--color-info)",
}

export function toneColor(tone: Tone): string {
  return TONE_COLORS[tone]
}
