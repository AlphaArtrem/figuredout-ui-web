"use client"

import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { Badge } from "../primitives/badge.js"
import { cn } from "../lib/cn.js"

export interface TabItem {
  content: ReactNode
  description?: ReactNode
  disabled?: boolean
  id: string
  label: ReactNode
  badge?: ReactNode
}

export interface TabsProps {
  defaultValue?: string
  items: TabItem[]
  onValueChange?: (value: string) => void
  value?: string
}

export function Tabs({ defaultValue, items, onValueChange, value }: TabsProps) {
  const fallback = useMemo(() => items.find((item) => !item.disabled)?.id ?? items[0]?.id ?? "", [items])
  const [internalValue, setInternalValue] = useState(defaultValue ?? fallback)
  const activeValue = value ?? internalValue

  useEffect(() => {
    if (!activeValue) {
      setInternalValue(fallback)
    }
  }, [activeValue, fallback])

  const activeTab = items.find((item) => item.id === activeValue) ?? items[0]

  const updateValue = (nextValue: string) => {
    setInternalValue(nextValue)
    onValueChange?.(nextValue)
  }

  const enabledItems = items.filter((item) => !item.disabled)

  return (
    /* `min-w-0` on the root, not just the track: Tabs is usually a grid or flex
     * item, and such an item's automatic minimum is its content's min-content —
     * a row of tabs that will not shrink. The parent then grows to fit the row
     * and the track never reaches the width it was supposed to scroll at. */
    <div className="min-w-0 space-y-4">
      {/* A segmented control: the track is the hole and the active tab is the
       * thing lifted out of it. The package had the track raised and the active
       * tab on `surface`, which on the light ladder made the selected tab look
       * recessed — the opposite of what selection means. */}
      {/* One line, whatever the count. `inline-flex` keeps the trough hugging
       * its tabs when there are few — a full-width sunken bar behind three tabs
       * reads as empty — and `max-w-full` stops it there, so the overflow
       * scrolls instead of wrapping. A wrapped segmented control stacks two
       * troughs and loses the one-row-of-choices shape that makes it legible at
       * a glance.
       *
       * `min-w-0` is what makes `max-w-full` bite. Tabs that refuse to shrink
       * give the trough a min-content width of the whole row, and a `grid` or
       * `flex` parent sizing to its content grows to that — the trough then
       * pushes the page sideways instead of scrolling inside it.
       *
       * The trough paints; the list inside it scrolls. They have to be separate
       * elements: the mask that keeps the run clear of the ring would otherwise
       * fade out the background and the ring along with the tabs. */}
      <div className="inline-flex min-w-0 max-w-full rounded-lg bg-surface-sunken py-1 ring-1 ring-inset ring-edge">
        {/* Padding alone only shows at the two ends of the scroll — a tab in the
         * middle of the run still meets the ring edge on. The mask fades the
         * run out across exactly the padding, so the gap holds at rest and the
         * tabs dissolve rather than being cut off while scrolling. Both stops
         * are the same 0.75rem, so at rest the first and last tab start where
         * the mask is already fully opaque. */}
        <div
          role="tablist"
          aria-orientation="horizontal"
          className={cn(
            "flex min-w-0 gap-1 overflow-x-auto px-3",
            "[mask-image:linear-gradient(to_right,transparent_0,black_0.75rem,black_calc(100%_-_0.75rem),transparent_100%)]",
            "[-webkit-mask-image:linear-gradient(to_right,transparent_0,black_0.75rem,black_calc(100%_-_0.75rem),transparent_100%)]",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {items.map((item) => (
            <button
              key={item.id}
              id={`tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={item.id === activeValue}
              aria-controls={`panel-${item.id}`}
              tabIndex={item.id === activeValue ? 0 : -1}
              disabled={item.disabled}
              className={cn(
                /* `shrink-0` and `whitespace-nowrap`: a tab that squeezes or
                 * breaks its label is what the scroll is there to avoid. */
                "inline-flex min-h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-4 text-sm transition duration-normal ease-standard",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring active:scale-[0.98]",
                item.id === activeValue
                  ? "bg-surface-raised font-semibold text-fg shadow-raised ring-1 ring-inset ring-edge"
                  : "font-medium text-fg-muted hover:text-fg",
                item.disabled && "cursor-not-allowed opacity-45",
              )}
              onClick={() => updateValue(item.id)}
              onKeyDown={(event) => {
                if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
                  return
                }
                event.preventDefault()
                if (enabledItems.length === 0) {
                  return
                }
                const currentIndex = enabledItems.findIndex((enabled) => enabled.id === item.id)
                const lastIndex = enabledItems.length - 1
                let nextIndex = currentIndex
                if (event.key === "ArrowRight") {
                  nextIndex = currentIndex >= lastIndex ? 0 : currentIndex + 1
                }
                if (event.key === "ArrowLeft") {
                  nextIndex = currentIndex <= 0 ? lastIndex : currentIndex - 1
                }
                if (event.key === "Home") {
                  nextIndex = 0
                }
                if (event.key === "End") {
                  nextIndex = lastIndex
                }
                const nextId = enabledItems[nextIndex]?.id
                if (!nextId) {
                  return
                }
                updateValue(nextId)
                const nextButton = document.getElementById(`tab-${nextId}`)
                nextButton?.focus()
              }}
            >
              <span>{item.label}</span>
              {item.badge ? <Badge tone="neutral">{item.badge}</Badge> : null}
            </button>
          ))}
        </div>
      </div>
      {activeTab ? (
        <div
          id={`panel-${activeTab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab.id}`}
          className="rounded-xl bg-surface p-5 ring-1 ring-inset ring-edge"
        >
          {activeTab.description ? <p className="mb-3 text-sm text-fg-muted">{activeTab.description}</p> : null}
          {activeTab.content}
        </div>
      ) : null}
    </div>
  )
}
