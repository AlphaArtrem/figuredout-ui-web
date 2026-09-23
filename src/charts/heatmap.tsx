import { cn } from "../lib/cn.js"
import { sequentialColor, trackColor } from "./palette.js"

export interface HeatmapAxisItem {
  key: string
  label: string
}

export interface HeatmapProps {
  className?: string
  columns: HeatmapAxisItem[]
  /** Names the grid — it is the table's caption, visually hidden. */
  label: string
  /** The value that gets the full colour. Defaults to the largest value present. */
  max?: number
  /** The value that gets the faintest colour. Defaults to 0. */
  min?: number
  /** Spoken, and shown on hover, for a cell with no value. Defaults to "No data". */
  missingLabel?: string
  rows: HeatmapAxisItem[]
  /** A low-to-high key under the grid. Defaults to true. */
  showScale?: boolean
  /** Prints each value in its cell. Off by default: a heatmap is read by colour, with the number on hover. */
  showValues?: boolean
  valueFormatter?: (value: number) => string
  /** One array per row, one value per column. `null` is a cell with no data, not zero. */
  values: Array<Array<number | null | undefined>>
}

/* The sequential hue mixed into the track, so the faintest cell is still a
 * cell and zero is visibly different from "no data" (which is bare track). */
function cellColor(strength: number): string {
  return `color-mix(in srgb, ${sequentialColor} ${Math.round(12 + 88 * strength)}%, ${trackColor})`
}

/**
 * A value per row × column, as a grid of cells whose colour carries magnitude —
 * activity by weekday and hour, a measure by team and month. It is an HTML
 * table underneath, so every value is in the page and a screen reader can walk
 * it by row and column header; the colour is the only part that is visual.
 */
export function Heatmap({
  className,
  columns,
  label,
  max,
  min = 0,
  missingLabel = "No data",
  rows,
  showScale = true,
  showValues = false,
  valueFormatter = (value) => String(value),
  values,
}: HeatmapProps) {
  const present = values.flat().filter((value): value is number => typeof value === "number" && Number.isFinite(value))
  const top = max ?? Math.max(min, ...present)
  const range = top - min
  const strengthOf = (value: number) =>
    range > 0 ? Math.min(1, Math.max(0, (value - min) / range)) : value > min ? 1 : 0

  return (
    <div className={cn("min-w-0", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-[3px]">
          <caption className="sr-only">{label}</caption>
          <thead>
            <tr>
              <td className="w-px" />
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="px-0.5 pb-1 text-center font-mono text-[0.6875rem] font-normal tabular-nums text-fg-subtle"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.key}>
                <th scope="row" className="w-px whitespace-nowrap pr-2 text-left text-xs font-normal text-fg-muted">
                  {row.label}
                </th>
                {columns.map((column, columnIndex) => {
                  const value = values[rowIndex]?.[columnIndex]
                  const has = typeof value === "number" && Number.isFinite(value)
                  const strength = has ? strengthOf(value) : 0
                  const text = has ? valueFormatter(value) : missingLabel
                  return (
                    <td key={column.key} className="p-0">
                      <div
                        title={`${row.label}, ${column.label}: ${text}`}
                        className={cn(
                          "grid h-7 min-w-6 place-items-center rounded-[0.25rem] font-mono text-[0.6875rem] tabular-nums",
                          !has && "bg-chart-track",
                          /* --chart-seq is the primary hue in both themes, so a
                           * strong cell takes primary's own ink. */
                          strength >= 0.6 ? "text-primary-fg" : "text-fg",
                        )}
                        style={has ? { backgroundColor: cellColor(strength) } : undefined}
                      >
                        {showValues && has ? (
                          <span>{text}</span>
                        ) : (
                          <span className="sr-only">{text}</span>
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showScale ? (
        <div aria-hidden="true" className="mt-2 flex items-center justify-end gap-1 font-mono text-[0.6875rem] tabular-nums text-fg-subtle">
          <span className="mr-1">{valueFormatter(min)}</span>
          {[0, 0.25, 0.5, 0.75, 1].map((step) => (
            <span key={step} className="block size-3 rounded-[0.1875rem]" style={{ backgroundColor: cellColor(step) }} />
          ))}
          <span className="ml-1">{valueFormatter(top)}</span>
        </div>
      ) : null}
    </div>
  )
}
