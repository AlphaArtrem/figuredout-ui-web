"use client"

export interface ChartTooltipPayloadEntry {
  color?: string
  name: string
  value: number | string
}

export interface ChartTooltipProps {
  active?: boolean
  label?: string
  labelFormatter?: (label: string) => string
  payload?: Array<{ color?: string; name?: string; value?: number | string }>
  valueFormatter?: (value: number | string, name: string) => string
}

export function ChartTooltip({
  active,
  label,
  labelFormatter,
  payload,
  valueFormatter,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    /* The same floating surface as every menu and dialog — raised, overlay
     * shadow, strong ring — so the card a chart shows on hover agrees with the
     * table showing the same numbers underneath it. The x value takes the mono
     * caption role; the series values are tabular figures. */
    <div className="min-w-[8rem] rounded-md bg-surface-raised px-3 py-2 text-xs shadow-overlay ring-1 ring-inset ring-edge-strong">
      {label ? (
        <div className="mb-1.5 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-fg-subtle">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      ) : null}
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const name = entry.name ?? ""
          const value = entry.value ?? ""
          return (
            <div key={`${name}-${index}`} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-fg-muted">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {name}
              </span>
              <span className="font-mono tabular-nums text-fg">
                {valueFormatter ? valueFormatter(value, name) : value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
