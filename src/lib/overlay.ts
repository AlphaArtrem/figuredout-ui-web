/**
 * One surface for everything that floats over the page and holds a list —
 * DropdownMenu, SelectMenu, and anything added later.
 *
 * Raised surface, the overlay elevation, the strong ring, and 4px of padding so
 * a highlighted row's own radius nests inside the container's instead of
 * colliding with it. Kept here rather than duplicated per component: the moment
 * two popovers disagree about their shadow, the app stops looking like one app.
 */
export const POPOVER_SURFACE =
  "z-overlay rounded-lg bg-surface-raised p-1 shadow-overlay ring-1 ring-inset ring-edge-strong motion-safe:animate-rise"

export function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      [
        "a[href]",
        "button:not([disabled])",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])",
      ].join(","),
    ),
  ).filter((element) => !element.hasAttribute("disabled") && !element.getAttribute("aria-hidden"))
}

export function trapFocus(event: KeyboardEvent, container: HTMLElement) {
  if (event.key !== "Tab") {
    return
  }

  const focusable = getFocusableElements(container)
  if (focusable.length === 0) {
    event.preventDefault()
    container.focus()
    return
  }

  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const active = document.activeElement

  if (event.shiftKey && active === first) {
    event.preventDefault()
    last?.focus()
    return
  }

  if (!event.shiftKey && active === last) {
    event.preventDefault()
    first?.focus()
  }
}
