"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
import { CaretDown, Check } from "../icons/index.js"
import { cn } from "../lib/cn.js"
import { POPOVER_SURFACE } from "../lib/overlay.js"

export interface SelectMenuOption {
  description?: ReactNode
  disabled?: boolean
  label: ReactNode
  value: string
}

export interface SelectMenuProps {
  className?: string
  disabled?: boolean
  emptyMessage?: ReactNode
  id?: string
  label?: ReactNode
  onChange: (value: string) => void
  options: SelectMenuOption[]
  placeholder?: ReactNode
  value: string
}

export function SelectMenu({
  className,
  disabled = false,
  emptyMessage = "No options",
  id,
  label,
  onChange,
  options,
  placeholder = "Select",
  value,
}: SelectMenuProps) {
  const generatedId = useId()
  const buttonId = id ?? generatedId
  const listboxId = `${buttonId}-listbox`
  const containerRef = useRef<HTMLDivElement | null>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [open, setOpen] = useState(false)
  const selectedIndex = options.findIndex((option) => option.value === value)
  const enabledIndexes = useMemo(
    () => options.map((option, index) => (option.disabled ? -1 : index)).filter((index) => index >= 0),
    [options],
  )
  const firstEnabledIndex = enabledIndexes[0] ?? -1
  const [activeIndex, setActiveIndex] = useState(selectedIndex >= 0 ? selectedIndex : firstEnabledIndex)
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null

  useEffect(() => {
    if (!open) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }
    optionRefs.current[activeIndex]?.focus()
  }, [activeIndex, open])

  const openAt = (nextIndex: number) => {
    setActiveIndex(nextIndex)
    setOpen(true)
  }

  const moveActive = (direction: 1 | -1) => {
    if (enabledIndexes.length === 0) {
      return
    }
    const currentEnabledPosition = enabledIndexes.indexOf(activeIndex)
    const nextEnabledPosition = currentEnabledPosition === -1
      ? 0
      : (currentEnabledPosition + direction + enabledIndexes.length) % enabledIndexes.length
    setActiveIndex(enabledIndexes[nextEnabledPosition] ?? firstEnabledIndex)
  }

  const selectOption = (option: SelectMenuOption) => {
    if (option.disabled) {
      return
    }
    onChange(option.value)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={cn("relative grid gap-1.5", className)}>
      {label ? (
        <label htmlFor={buttonId} className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-fg-subtle">
          {label}
        </label>
      ) : null}
      <button
        id={buttonId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className={cn(
          /* The same sunken control surface as Input: this is a field, and a
           * field is a hole you type into whether or not it takes a caret. */
          "flex min-h-11 w-full items-center justify-between gap-3 rounded-md border-0 bg-surface-sunken px-3 py-2.5 text-left text-sm text-fg transition duration-normal ease-standard",
          "shadow-[inset_0_0_0_1px_var(--color-edge)] hover:shadow-[inset_0_0_0_1px_var(--color-edge-strong)]",
          "focus:bg-surface focus:shadow-[inset_0_0_0_1px_var(--color-primary)] focus:outline-none focus:ring-4 focus:ring-focus-ring",
          "disabled:cursor-not-allowed disabled:text-fg-subtle disabled:opacity-70",
        )}
        onClick={() => {
          const nextIndex = selectedIndex >= 0 ? selectedIndex : firstEnabledIndex
          open ? setOpen(false) : openAt(nextIndex)
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault()
            openAt(selectedIndex >= 0 ? selectedIndex : firstEnabledIndex)
          }
        }}
      >
        <span className={cn("truncate", !selectedOption && "text-fg-subtle")}>
          {selectedOption?.label ?? placeholder}
        </span>
        <CaretDown
          size={16}
          aria-hidden="true"
          className={cn("shrink-0 text-fg-subtle transition duration-fast ease-standard", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={buttonId}
          className={cn("absolute left-0 right-0 top-[calc(100%+0.5rem)] max-h-72 overflow-auto", POPOVER_SURFACE)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault()
              setOpen(false)
              document.getElementById(buttonId)?.focus()
              return
            }
            if (event.key === "ArrowDown") {
              event.preventDefault()
              moveActive(1)
              return
            }
            if (event.key === "ArrowUp") {
              event.preventDefault()
              moveActive(-1)
              return
            }
            if (event.key === "Home") {
              event.preventDefault()
              setActiveIndex(firstEnabledIndex)
              return
            }
            if (event.key === "End") {
              event.preventDefault()
              setActiveIndex(enabledIndexes[enabledIndexes.length - 1] ?? firstEnabledIndex)
            }
          }}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-fg-muted">{emptyMessage}</div>
          ) : null}
          {options.map((option, index) => (
            <button
              key={option.value}
              ref={(element) => {
                optionRefs.current[index] = element
              }}
              type="button"
              role="option"
              aria-selected={option.value === value}
              disabled={option.disabled}
              className={cn(
                "flex w-full items-start justify-between gap-3 rounded-md px-3 py-2.5 text-left text-sm transition duration-fast ease-standard",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring",
                option.value === value ? "bg-primary-soft font-semibold text-fg" : "text-fg hover:bg-primary-soft",
                option.disabled && "cursor-not-allowed opacity-50",
              )}
              onClick={() => selectOption(option)}
              onFocus={() => setActiveIndex(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  selectOption(option)
                }
              }}
            >
              <span className="grid min-w-0 gap-0.5">
                <span className="truncate font-medium">{option.label}</span>
                {option.description ? <span className="text-xs text-fg-muted">{option.description}</span> : null}
              </span>
              <Check
                size={16}
                aria-hidden="true"
                className={cn("mt-0.5 shrink-0 text-primary", option.value !== value && "invisible")}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
