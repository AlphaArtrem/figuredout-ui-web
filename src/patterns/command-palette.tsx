"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import type { KeyboardEvent, ReactNode } from "react"
import { createPortal } from "react-dom"
import { MagnifyingGlass } from "../icons/index.js"
import { cn } from "../lib/cn.js"
import { useDialogFocus } from "../lib/use-dialog-focus.js"
import { Kbd } from "../primitives/kbd.js"

export interface CommandPaletteItem {
  disabled?: boolean
  /** A tile, an avatar or a figure on the left. Decorative: mark it `aria-hidden`. */
  icon?: ReactNode
  id: string
  /** Extra words the default filter matches on — synonyms, an id, a phone number. */
  keywords?: string[]
  onSelect?: () => void
  /** Keys that run this item elsewhere in the app, e.g. `["⌘", "L"]`. Shown as hints; the palette does not bind them. */
  shortcut?: string[]
  subtitle?: ReactNode
  /**
   * The item's text for the default filter. Needed when `title` is not a plain
   * string; otherwise the title is used.
   */
  textValue?: string
  title: ReactNode
}

export interface CommandPaletteGroup {
  id: string
  items: CommandPaletteItem[]
  label: ReactNode
}

export interface CommandPaletteProps {
  /** Shown when nothing matches. Defaults to a sentence quoting the query. */
  emptyState?: ReactNode | ((query: string) => ReactNode)
  /**
   * Filter the groups by the query (the default), or `false` when the caller
   * searches for itself — a server query — and passes groups that already match.
   * A function replaces the built-in match.
   */
  filter?: boolean | ((item: CommandPaletteItem, query: string) => boolean)
  /** The strip of key hints under the list. `null` hides it. */
  footer?: ReactNode
  /** The dialog's accessible name. `"Command palette"` by default. */
  label?: string
  groups: CommandPaletteGroup[]
  onOpenChange: (open: boolean) => void
  /** Called with the chosen item, after its own `onSelect`. */
  onSelect?: (item: CommandPaletteItem) => void
  /** Controlled query. Leave unset and the palette keeps its own, cleared each time it opens. */
  query?: string
  onQueryChange?: (query: string) => void
  open: boolean
  placeholder?: string
  /** The search field's accessible name. `"Search"` by default. */
  searchLabel?: string
  /** Keep the palette open after a selection. Off by default. */
  keepOpenOnSelect?: boolean
}

function itemText(item: CommandPaletteItem) {
  if (item.textValue) {
    return item.textValue
  }
  return typeof item.title === "string" || typeof item.title === "number" ? String(item.title) : ""
}

function defaultMatch(item: CommandPaletteItem, query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) {
    return true
  }
  const subtitle = typeof item.subtitle === "string" ? item.subtitle : ""
  return [itemText(item), subtitle, ...(item.keywords ?? [])].some((text) => text.toLowerCase().includes(needle))
}

const DEFAULT_FOOTER = (
  <>
    <span className="inline-flex items-center gap-1.5">
      <Kbd>↑</Kbd>
      <Kbd>↓</Kbd>
      to move
    </span>
    <span className="inline-flex items-center gap-1.5">
      <Kbd>↵</Kbd>
      to choose
    </span>
    <span className="inline-flex items-center gap-1.5">
      <Kbd>esc</Kbd>
      to close
    </span>
  </>
)

/*
 * A modal search over everything the app can open or do.
 *
 * The same modal contract as `Dialog` (the focus hook is shared): focus moves
 * into the search field, Tab is trapped, Escape and the overlay close it, and
 * focus goes back where it came from. Inside, it is a combobox over a listbox,
 * driven by `aria-activedescendant` like `TagPicker` — focus never leaves the
 * field, so typing, moving and choosing are one gesture. Up/Down move (and
 * wrap), Enter chooses, the pointer moves the highlight as it hovers.
 *
 * Presentational like everything else here: the caller owns `open`, may own the
 * query, and supplies the groups. `useCommandPaletteShortcut` binds ⌘K/Ctrl+K.
 */
export function CommandPalette({
  emptyState,
  filter = true,
  footer = DEFAULT_FOOTER,
  groups,
  keepOpenOnSelect = false,
  label = "Command palette",
  onOpenChange,
  onQueryChange,
  onSelect,
  open,
  placeholder = "Search or jump to…",
  query: controlledQuery,
  searchLabel = "Search",
}: CommandPaletteProps) {
  const baseId = useId()
  const listboxId = `${baseId}-listbox`
  const containerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const [internalQuery, setInternalQuery] = useState("")
  const query = controlledQuery ?? internalQuery
  const [activeIndex, setActiveIndex] = useState(0)

  useDialogFocus({ containerRef, initialFocusRef: inputRef, onOpenChange, open })

  /* A palette reopens empty: last time's query is last time's intent. */
  useEffect(() => {
    if (open && controlledQuery === undefined) {
      setInternalQuery("")
    }
  }, [controlledQuery, open])

  const visibleGroups = useMemo(() => {
    if (filter === false) {
      return groups.filter((group) => group.items.length > 0)
    }
    const match = typeof filter === "function" ? filter : defaultMatch
    return groups
      .map((group) => ({ ...group, items: group.items.filter((item) => match(item, query)) }))
      .filter((group) => group.items.length > 0)
  }, [filter, groups, query])

  /* One flat index across the groups, so Up/Down walk straight through them. */
  const flatItems = useMemo(() => visibleGroups.flatMap((group) => group.items), [visibleGroups])
  const enabledIndexes = useMemo(
    () => flatItems.flatMap((item, index) => (item.disabled ? [] : [index])),
    [flatItems],
  )

  useEffect(() => {
    setActiveIndex(enabledIndexes[0] ?? -1)
  }, [enabledIndexes, open])

  /* `aria-activedescendant` scrolls nothing; the row is brought into view by
   * hand. Guarded because jsdom has no `scrollIntoView`. */
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView?.({ block: "nearest" })
  }, [activeIndex])

  const setQuery = (next: string) => {
    if (controlledQuery === undefined) {
      setInternalQuery(next)
    }
    onQueryChange?.(next)
  }

  const choose = (item: CommandPaletteItem | undefined) => {
    if (!item || item.disabled) {
      return
    }
    item.onSelect?.()
    onSelect?.(item)
    if (!keepOpenOnSelect) {
      onOpenChange(false)
    }
  }

  const move = (step: 1 | -1) => {
    if (enabledIndexes.length === 0) {
      return
    }
    const position = enabledIndexes.indexOf(activeIndex)
    const nextPosition =
      position === -1
        ? step === 1
          ? 0
          : enabledIndexes.length - 1
        : (position + step + enabledIndexes.length) % enabledIndexes.length
    setActiveIndex(enabledIndexes[nextPosition] ?? -1)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      move(1)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      move(-1)
    } else if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault()
      choose(flatItems[activeIndex])
    }
  }

  if (!open || typeof document === "undefined") {
    return null
  }

  const optionId = (index: number) => `${listboxId}-option-${index}`
  const hasResults = flatItems.length > 0
  const empty =
    typeof emptyState === "function"
      ? emptyState(query)
      : (emptyState ?? (query.trim() ? `Nothing matches “${query.trim()}”.` : "Nothing to show yet."))

  let runningIndex = -1

  return createPortal(
    <div className="fixed inset-0 z-overlay flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Close command palette"
        tabIndex={-1}
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-fg)_28%,transparent)] backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cn(
          /* Dialog's anatomy at overlay elevation: raised surface, the strong
           * hairline as an overlay (the footer band paints its own surface over
           * an inset ring), `max-h` so a long result list scrolls inside. */
          "relative z-[1] flex max-h-[min(34rem,76vh)] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-surface-raised text-fg shadow-overlay outline-none motion-safe:animate-rise",
          "after:pointer-events-none after:absolute after:inset-0 after:z-[2] after:rounded-[inherit] after:ring-1 after:ring-inset after:ring-edge-strong after:content-['']",
        )}
      >
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-edge px-4">
          <MagnifyingGlass size={18} aria-hidden="true" className="shrink-0 text-fg-subtle" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-label={searchLabel}
            aria-expanded="true"
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeIndex >= 0 && hasResults ? optionId(activeIndex) : undefined}
            autoComplete="off"
            spellCheck={false}
            value={query}
            placeholder={placeholder}
            className="h-full min-w-0 flex-1 border-0 bg-transparent text-base text-fg placeholder:text-fg-subtle focus:outline-none"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Kbd className="hidden sm:inline-flex">esc</Kbd>
        </div>

        <div ref={listRef} id={listboxId} role="listbox" aria-label={label} className="min-h-0 flex-1 overflow-y-auto p-2">
          {visibleGroups.map((group) => {
            const groupLabelId = `${baseId}-group-${group.id}`
            return (
              <div key={group.id} role="group" aria-labelledby={groupLabelId} className="pb-1">
                <div
                  id={groupLabelId}
                  className="px-3 pb-1 pt-2 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-fg-subtle"
                >
                  {group.label}
                </div>
                {group.items.map((item) => {
                  runningIndex += 1
                  const index = runningIndex
                  const active = index === activeIndex
                  return (
                      <div
                        key={item.id}
                        id={optionId(index)}
                        role="option"
                        aria-selected={active}
                        aria-disabled={item.disabled || undefined}
                        data-active={active}
                        className={cn(
                          "flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors duration-fast ease-standard",
                          active ? "bg-primary-soft" : "hover:bg-primary-soft/60",
                          item.disabled && "cursor-not-allowed opacity-45",
                        )}
                        /* `mousedown` is cancelled so a click never takes focus
                         * out of the search field. */
                        onMouseDown={(event) => event.preventDefault()}
                        onMouseMove={() => {
                          if (!item.disabled && activeIndex !== index) {
                            setActiveIndex(index)
                          }
                        }}
                        onClick={() => choose(item)}
                      >
                        {item.icon ? <span className="flex shrink-0 items-center">{item.icon}</span> : null}
                        <span className="grid min-w-0 flex-1 gap-0.5">
                          <span className="truncate text-sm font-medium text-fg">{item.title}</span>
                          {item.subtitle ? <span className="truncate text-xs text-fg-subtle">{item.subtitle}</span> : null}
                        </span>
                        {item.shortcut?.length ? (
                          <span aria-hidden="true" className="hidden shrink-0 items-center gap-1 sm:inline-flex">
                            {item.shortcut.map((key) => (
                              <Kbd key={key}>{key}</Kbd>
                            ))}
                          </span>
                        ) : null}
                      </div>
                  )
                })}
              </div>
            )
          })}
          {!hasResults ? <div className="px-3 py-10 text-center text-sm text-fg-muted">{empty}</div> : null}
        </div>

        {/* The result count, said once per change: an `aria-activedescendant`
          * list is otherwise silent about how many things matched. */}
        <div role="status" className="sr-only">
          {hasResults ? `${flatItems.length} ${flatItems.length === 1 ? "result" : "results"}` : typeof empty === "string" ? empty : ""}
        </div>

        {footer !== null ? (
          <div className="hidden shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-t border-edge bg-surface-sunken px-4 py-2.5 text-xs text-fg-subtle sm:flex">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}

export interface CommandPaletteShortcutOptions {
  /** Turn the binding off without unmounting — while another modal is open, say. On by default. */
  enabled?: boolean
  /** The letter that goes with ⌘/Ctrl. `"k"` by default. */
  key?: string
}

/**
 * Binds ⌘K (macOS) and Ctrl+K (everywhere else) to `onTrigger` — pass a toggle.
 * The browser's own Ctrl+K (focus the address bar's search) is suppressed while
 * the page has focus, which is the convention every palette-driven app follows.
 */
export function useCommandPaletteShortcut(onTrigger: () => void, options: CommandPaletteShortcutOptions = {}) {
  const { enabled = true, key = "k" } = options
  /* Held in a ref so an inline arrow does not rebind the listener each render. */
  const triggerRef = useRef(onTrigger)
  triggerRef.current = onTrigger

  useEffect(() => {
    if (!enabled) {
      return
    }
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === key.toLowerCase()) {
        event.preventDefault()
        triggerRef.current()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [enabled, key])
}
