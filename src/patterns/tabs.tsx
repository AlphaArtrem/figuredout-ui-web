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
    <div className="space-y-4">
      <div role="tablist" aria-orientation="horizontal" className="flex flex-wrap gap-2 rounded-lg bg-surface-raised p-2">
        {items.map((item, index) => (
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
              "inline-flex min-h-10 items-center gap-2 rounded-md px-4 text-sm font-medium transition duration-normal ease-standard",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring active:scale-[0.98]",
              item.id === activeValue
                ? "bg-surface text-fg shadow-raised"
                : "text-fg-muted hover:bg-surface hover:text-fg",
              item.disabled && "cursor-not-allowed opacity-50",
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
      {activeTab ? (
        <div
          id={`panel-${activeTab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab.id}`}
          className="rounded-lg bg-surface-raised p-5"
        >
          {activeTab.description ? (
            <p className="mb-3 text-sm text-fg-muted">{activeTab.description}</p>
          ) : null}
          {activeTab.content}
        </div>
      ) : null}
    </div>
  )
}
