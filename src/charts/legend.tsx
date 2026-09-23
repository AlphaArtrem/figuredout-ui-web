"use client"

import type { ReactNode } from "react"
import { cn } from "../lib/cn.js"
import type { Tone } from "../lib/tone.js"
import { resolveColor } from "./resolve-color.js"

export interface LegendItem {
  /** Any CSS colour — normally `categoricalColor(i)` or a `--chart-*` token. Wins over `tone`. */
  color?: string
  key: string
  label: ReactNode
  tone?: Tone
  /** A figure beside the label, rendered mono and tabular. */
  value?: ReactNode
}

export interface LegendProps {
  className?: string
  items: LegendItem[]
  /** Names the list for a screen reader. Omit when a visible heading already does. */
  label?: string
  /**
   * `inline` wraps entries along a row — under a chart. `stacked` is one entry
   * per line with the value right-aligned, so a column of values reads down.
   */
  layout?: "inline" | "stacked"
  /** Makes every entry a button. The legend is the keyboard path to the parts it names. */
  onSelect?: (key: string) => void
}

/**
 * Swatch, label and optional value for each part of a chart. Colours resolve
 * the same way the charts resolve them (explicit colour, then tone, then the
 * categorical palette by position), so an entry passed to both matches.
 */
export function Legend({ className, items, label, layout = "inline", onSelect }: LegendProps) {
  const stacked = layout === "stacked"
  return (
    <ul
      aria-label={label}
      className={cn(
        "m-0 list-none p-0",
        stacked ? "flex flex-col gap-1.5" : "flex flex-wrap gap-x-4 gap-y-1.5",
        className,
      )}
    >
      {items.map((item, index) => {
        const content = (
          <>
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: resolveColor(item, index) }}
            />
            <span className={cn("min-w-0", stacked && "flex-1 truncate")}>{item.label}</span>
            {item.value != null ? (
              <>
                {/* The label and the value are adjacent text nodes, so without a
                  * separator a screen reader runs them together ("Won12"). The
                  * gap a sighted reader sees is layout; this one is spoken. */}
                <span className="sr-only">: </span>
                <span className="shrink-0 font-mono font-semibold tabular-nums text-fg">{item.value}</span>
              </>
            ) : null}
          </>
        )
        const row = cn("flex items-center gap-1.5 text-xs text-fg-muted", stacked && "w-full justify-between gap-3")
        return (
          <li key={item.key} className="flex min-w-0">
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(item.key)}
                className={cn(
                  row,
                  /* The negative margin keeps the swatch on the same edge as a
                   * legend without buttons; the padding is the hover wash. */
                  "-mx-1.5 rounded-sm px-1.5 py-0.5 text-left transition duration-fast ease-standard hover:bg-surface-raised hover:text-fg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring",
                  stacked && "w-[calc(100%+0.75rem)]",
                )}
              >
                {content}
              </button>
            ) : (
              <span className={row}>{content}</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
