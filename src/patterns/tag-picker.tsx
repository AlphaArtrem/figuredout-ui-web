"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
import { Check, Plus, X } from "../icons/index.js"
import { cn } from "../lib/cn.js"
import { useFieldAria } from "../primitives/form-field.js"
import { POPOVER_SURFACE } from "../lib/overlay.js"

export interface TagPickerOption {
  disabled?: boolean
  /** Secondary text on the right of a row — a usage count, a group name. */
  hint?: ReactNode
  label: string
  value: string
}

export interface TagPickerProps {
  /** Shown on the create row while the call site's `onCreate` promise is in flight. */
  creating?: boolean
  className?: string
  /** The create row's own words. The option list is configuration; so is what a new one is called. */
  createLabel?: (query: string) => ReactNode
  disabled?: boolean
  emptyMessage?: ReactNode
  id?: string
  invalid?: boolean
  /** Only for a call site with no `FormField` around it. Inside one, the field's label is the name. */
  label?: ReactNode
  onChange: (values: string[]) => void
  /**
   * Wired by the call site to whatever creates an option — the package must not
   * know where the list comes from. Omit it and the create row never appears,
   * which is the right answer for a closed list or a reader without the right.
   * Resolve with the new option's `value` to have it selected; resolve with
   * nothing to leave the selection alone.
   */
  onCreate?: (label: string) => Promise<string | void> | void
  options: TagPickerOption[]
  /** The empty field's prompt — "Search work types…", "Search or add a niche…". */
  placeholder?: string
  /** The prompt once something is chosen, so the field stops repeating itself. */
  placeholderWithSelection?: string
  value: string[]
}

/*
 * The multi-value sibling of `SelectMenu`, and the replacement for a wall of
 * checkboxes.
 *
 * Review finding 01: a category-backed MULTI_SELECT rendered every option as a
 * checkbox — 28 of them in four groups on one form — with no search, no count,
 * and no way to add a missing option without leaving the form and losing what
 * had been typed. Finding 80 is the same control seen from the accessibility
 * tree: 28 checkboxes with no `fieldset`, `legend` or `role="group"` anywhere,
 * so an option announced as "Long-form YouTube, checkbox" with nothing saying
 * which question it answered.
 *
 * Both are answered by the same three structural choices:
 *
 * - **A named group.** The whole control is a `role="group"` named from the
 *   enclosing `FormField`'s label, so every option is announced inside
 *   "Work Type" rather than beside it. `role="group"` with `aria-labelledby`
 *   rather than a `fieldset`/`legend` because the field already draws and owns
 *   the visible label — a `legend` would print it twice — and because
 *   `aria-labelledby` is how every other control in this package inherits its
 *   name (`traps.md` §51: the control reaches the label, not the reverse).
 * - **A combobox over a multi-selectable listbox.** Focus stays in the text
 *   input and the active row is pointed at with `aria-activedescendant`, so
 *   filtering and moving are the same gesture. `SelectMenu` moves DOM focus
 *   between options instead; it can, because it has no query to keep typing
 *   into.
 * - **Chips.** The answer is readable without re-reading the options, which is
 *   the half of finding 01 that a search box alone does not fix.
 *
 * Keyboard, and it is complete on purpose — this is a new control, so there is
 * no legacy behaviour to preserve: type to filter, up/down to move, Enter to
 * toggle (or to create, on the create row), Backspace on an empty query to drop
 * the last chip, Escape to close, Home/End to jump.
 */
export function TagPicker({
  className,
  createLabel,
  creating = false,
  disabled = false,
  emptyMessage = "Nothing here matches.",
  id,
  invalid = false,
  label,
  onChange,
  onCreate,
  options,
  placeholder = "Search…",
  placeholderWithSelection = "Add another…",
  value,
}: TagPickerProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const listboxId = `${inputId}-listbox`
  const labelId = `${inputId}-label`
  const containerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const fieldAria = useFieldAria(
    label != null ? { "aria-labelledby": labelId } : {},
    invalid,
  )
  /* The group's name and the input's name are the same name. A group with no
   * name is finding 80 again with a `role` on it, so if neither a `FormField`
   * nor a `label` prop has provided one there is nothing to point at and the
   * attribute is left off rather than pointed at an id that does not exist. */
  const groupLabelledBy = fieldAria["aria-labelledby"]

  const trimmed = query.trim()
  const matches = useMemo(() => {
    const needle = trimmed.toLowerCase()
    return needle ? options.filter((option) => option.label.toLowerCase().includes(needle)) : options
  }, [options, trimmed])

  const exactExists = useMemo(
    () => options.some((option) => option.label.toLowerCase() === trimmed.toLowerCase()),
    [options, trimmed],
  )
  const canCreate = Boolean(onCreate) && trimmed.length > 0 && !exactExists
  /* The create row is the last row, so one index walks both. */
  const rowCount = matches.length + (canCreate ? 1 : 0)
  const createIndex = canCreate ? matches.length : -1

  const selectedOptions = useMemo(
    () =>
      value.map(
        (selected) =>
          options.find((option) => option.value === selected) ?? { label: selected, value: selected },
      ),
    [options, value],
  )

  useEffect(() => {
    setActiveIndex(0)
  }, [trimmed])

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

  /* `aria-activedescendant` does not scroll anything; the row has to be brought
   * into view by hand or a long list moves under a stationary viewport.
   * Guarded because jsdom has no `scrollIntoView` at all. */
  useEffect(() => {
    if (!open) {
      return
    }
    const active = listRef.current?.querySelector<HTMLElement>('[data-active="true"]')
    active?.scrollIntoView?.({ block: "nearest" })
  }, [activeIndex, open])

  const rowId = (index: number) => `${listboxId}-row-${index}`

  const toggle = (optionValue: string) => {
    const has = value.includes(optionValue)
    onChange(has ? value.filter((v) => v !== optionValue) : [...value, optionValue])
    /* Clearing the query after an add is what makes "pick three" one gesture
     * per pick instead of a type-select-clear cycle. Removing keeps it, because
     * a removal is usually a correction and the query is how it was found. */
    if (!has) {
      setQuery("")
    }
  }

  const create = () => {
    if (!onCreate || !canCreate || creating) {
      return
    }
    const name = trimmed
    setQuery("")
    void Promise.resolve(onCreate(name)).then((created) => {
      if (typeof created === "string" && !value.includes(created)) {
        onChange([...value, created])
      }
    })
  }

  const activateRow = () => {
    if (activeIndex === createIndex) {
      create()
      return
    }
    const option = matches[activeIndex]
    if (option && !option.disabled) {
      toggle(option.value)
    }
  }

  const moveActive = (direction: 1 | -1) => {
    if (rowCount === 0) {
      return
    }
    setActiveIndex((current) => (current + direction + rowCount) % rowCount)
  }

  return (
    <div ref={containerRef} className={cn("grid gap-1.5", className)}>
      {label != null ? (
        <label
          id={labelId}
          htmlFor={inputId}
          className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-fg-subtle"
        >
          {label}
        </label>
      ) : null}

      <div
        role="group"
        {...(groupLabelledBy ? { "aria-labelledby": groupLabelledBy } : {})}
        className="relative grid gap-1.5"
      >
        {/* The field. Clicking anywhere in it — the padding between chips
          * included — puts the caret in the query, which is what a box that
          * looks like one text field has to do. */}
        <div
          className={cn(
            "flex min-h-11 flex-wrap items-center gap-1.5 rounded-md bg-surface-sunken px-2 py-1.5 transition duration-normal ease-standard",
            "shadow-[inset_0_0_0_1px_var(--color-edge)]",
            invalid && "shadow-[inset_0_0_0_1px_var(--color-danger)]",
            !disabled && "hover:shadow-[inset_0_0_0_1px_var(--color-edge-strong)]",
            "focus-within:bg-surface focus-within:shadow-[inset_0_0_0_1px_var(--color-primary)] focus-within:ring-4 focus-within:ring-focus-ring",
            disabled && "cursor-not-allowed opacity-70",
          )}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              event.preventDefault()
              inputRef.current?.focus()
              setOpen(true)
            }
          }}
        >
          {selectedOptions.map((option) => (
            <span
              key={option.value}
              className="inline-flex max-w-full items-center gap-1 rounded-full bg-primary-soft py-0.5 pl-2.5 pr-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/30"
            >
              <span className="truncate">{option.label}</span>
              <button
                type="button"
                disabled={disabled}
                aria-label={`Remove ${option.label}`}
                onClick={() => onChange(value.filter((v) => v !== option.value))}
                className="grid size-5 shrink-0 place-items-center rounded-full text-primary transition duration-fast ease-standard hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:cursor-not-allowed"
              >
                <X size={12} weight="bold" aria-hidden="true" />
              </button>
            </span>
          ))}

          <input
            ref={inputRef}
            id={inputId}
            type="text"
            role="combobox"
            autoComplete="off"
            disabled={disabled}
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            {...(open && rowCount > 0 ? { "aria-activedescendant": rowId(activeIndex) } : {})}
            {...fieldAria}
            value={query}
            placeholder={value.length > 0 ? placeholderWithSelection : placeholder}
            className="min-w-[8rem] flex-1 border-0 bg-transparent px-1 py-1 text-sm text-fg outline-none placeholder:text-fg-subtle disabled:cursor-not-allowed"
            onChange={(event) => {
              setQuery(event.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault()
                if (!open) {
                  setOpen(true)
                  return
                }
                moveActive(event.key === "ArrowDown" ? 1 : -1)
                return
              }
              if (event.key === "Enter") {
                /* Only when the list is open: otherwise Enter in a picker
                 * inside a form has to keep meaning "submit". */
                if (open && rowCount > 0) {
                  event.preventDefault()
                  activateRow()
                }
                return
              }
              if (event.key === "Escape") {
                if (open) {
                  event.preventDefault()
                  setOpen(false)
                }
                return
              }
              if (event.key === "Backspace" && query === "" && value.length > 0) {
                event.preventDefault()
                onChange(value.slice(0, -1))
                return
              }
              if (event.key === "Home" && open) {
                event.preventDefault()
                setActiveIndex(0)
                return
              }
              if (event.key === "End" && open && rowCount > 0) {
                event.preventDefault()
                setActiveIndex(rowCount - 1)
              }
            }}
          />
        </div>

        {/* The count, so the selection can be read without counting chips, and
          * a way out of a wrong one that is not "click sixteen X buttons". */}
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-xs text-fg-subtle">
            {value.length} of {options.length} selected
          </span>
          {value.length > 0 && !disabled ? (
            <button
              type="button"
              onClick={() => onChange([])}
              className="rounded-sm text-xs font-medium text-primary transition duration-fast ease-standard hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            >
              Clear all
            </button>
          ) : null}
        </div>

        {open && !disabled ? (
          <div className={cn("absolute left-0 right-0 top-[calc(100%+0.25rem)]", POPOVER_SURFACE)}>
            {/* The create row is a row of this listbox rather than a button
              * beside it: `aria-activedescendant` may only name a descendant of
              * the list the combobox controls, and one index has to walk both
              * halves for Enter to mean the same thing everywhere. `sticky`
              * keeps it on screen the way the artboard pins it, without taking
              * it out of the list. */}
            <div
              ref={listRef}
              id={listboxId}
              role="listbox"
              aria-multiselectable="true"
              {...(groupLabelledBy ? { "aria-labelledby": groupLabelledBy } : {})}
              className="max-h-64 overflow-y-auto"
            >
              {matches.length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-fg-muted">{emptyMessage}</p>
              ) : null}
              {matches.map((option, index) => {
                const isSelected = value.includes(option.value)
                return (
                  <div
                    key={option.value}
                    id={rowId(index)}
                    role="option"
                    aria-selected={isSelected}
                    {...(option.disabled ? { "aria-disabled": true } : {})}
                    data-active={index === activeIndex}
                    className={cn(
                      "flex min-h-10 cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-fg",
                      isSelected && "font-semibold",
                      index === activeIndex && "bg-primary-soft",
                      option.disabled && "cursor-not-allowed opacity-50",
                    )}
                    onMouseDown={(event) => {
                      /* The input must not lose focus, or the list closes under
                        * the pointer before the click lands. */
                      event.preventDefault()
                    }}
                    onClick={() => {
                      if (!option.disabled) {
                        toggle(option.value)
                        inputRef.current?.focus()
                      }
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "grid size-[1.15rem] shrink-0 place-items-center rounded-[0.35rem] transition duration-fast ease-standard",
                        isSelected
                          ? "bg-primary shadow-[inset_0_0_0_1px_var(--color-primary)]"
                          : "bg-surface-sunken shadow-[inset_0_0_0_1px_var(--color-edge-strong)]",
                      )}
                    >
                      <Check
                        size={12}
                        weight="bold"
                        className={cn("text-primary-fg", !isSelected && "opacity-0")}
                      />
                    </span>
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    {option.hint ? (
                      <span className="shrink-0 font-mono text-[0.6875rem] text-fg-subtle">{option.hint}</span>
                    ) : null}
                  </div>
                )
              })}

              {canCreate ? (
                <div
                  id={rowId(createIndex)}
                  role="option"
                  aria-selected={false}
                  {...(creating ? { "aria-disabled": true } : {})}
                  data-active={activeIndex === createIndex}
                  className={cn(
                    "sticky bottom-0 flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md border-t border-edge px-2.5 py-2.5 text-sm font-medium text-primary",
                    activeIndex === createIndex ? "bg-primary-soft" : "bg-surface-raised hover:bg-primary-soft",
                    creating && "cursor-wait opacity-70",
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(createIndex)}
                  onClick={() => {
                    create()
                    inputRef.current?.focus()
                  }}
                >
                  <Plus size={16} aria-hidden="true" className="shrink-0" />
                  <span className="truncate">{createLabel ? createLabel(trimmed) : `Add “${trimmed}”`}</span>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
