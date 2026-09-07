import userEvent from "@testing-library/user-event"
import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { DropdownMenu } from "./dropdown-menu.js"

const items = [{ label: "Mark reviewed" }, { label: "Remove", tone: "danger" as const }]

/* jsdom reports every rect as zero, so the menu has to be given one. Only the
 * element with `role="menu"` is stubbed — the clamp measures that and nothing
 * else, and leaving the rest at zero keeps the test honest about it. */
function stubMenuRect(rect: { left: number; right: number }) {
  const original = Element.prototype.getBoundingClientRect
  Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
    if (this.getAttribute?.("role") !== "menu") {
      return original.call(this)
    }
    return { ...rect, width: rect.right - rect.left, top: 0, bottom: 0, height: 0, x: rect.left, y: 0, toJSON() {} } as DOMRect
  }
  return () => {
    Element.prototype.getBoundingClientRect = original
  }
}

/* The clamp shifts the positioning wrapper, not the menu itself — the menu's own
 * transform belongs to its entry animation. */
function menuShift() {
  return screen.getByRole("menu").parentElement?.style.transform
}

describe("DropdownMenu", () => {
  let restoreRect: (() => void) | undefined

  afterEach(() => {
    restoreRect?.()
    restoreRect = undefined
  })

  it("slides a menu that overhangs the left edge back into view", async () => {
    const user = userEvent.setup()
    window.innerWidth = 320
    restoreRect = stubMenuRect({ left: -60, right: 164 })

    render(<DropdownMenu items={items} triggerVariant="icon" label="Row actions" />)
    await user.click(screen.getByRole("button", { name: "Row actions" }))

    /* -60 to the 8px gutter is a 68px correction. */
    expect(menuShift()).toBe("translateX(68px)")
  })

  it("slides a menu that overhangs the right edge back into view", async () => {
    const user = userEvent.setup()
    window.innerWidth = 320
    restoreRect = stubMenuRect({ left: 140, right: 364 })

    render(<DropdownMenu items={items} triggerVariant="icon" label="Row actions" />)
    await user.click(screen.getByRole("button", { name: "Row actions" }))

    /* 364 back to 320 - 8 is a 52px correction the other way. */
    expect(menuShift()).toBe("translateX(-52px)")
  })

  it("leaves a menu that already fits exactly where its alignment put it", async () => {
    const user = userEvent.setup()
    window.innerWidth = 1280
    restoreRect = stubMenuRect({ left: 400, right: 624 })

    render(<DropdownMenu items={items} triggerVariant="icon" label="Row actions" />)
    await user.click(screen.getByRole("button", { name: "Row actions" }))

    expect(menuShift()).toBe("")
  })

  it("selects an item and closes", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    render(<DropdownMenu items={[{ label: "Mark reviewed", onSelect }]} />)
    await user.click(screen.getByRole("button", { name: /Actions/ }))
    await user.click(screen.getByRole("menuitem", { name: /Mark reviewed/ }))

    expect(onSelect).toHaveBeenCalledOnce()
    expect(screen.queryByRole("menu")).not.toBeInTheDocument()
  })

  it("tells a reader the trigger opens a menu, and whether it is open", async () => {
    const user = userEvent.setup()

    render(<DropdownMenu items={items} triggerVariant="icon" label="Row actions" />)
    const trigger = screen.getByRole("button", { name: "Row actions" })

    expect(trigger).toHaveAttribute("aria-haspopup", "menu")
    expect(trigger).toHaveAttribute("aria-expanded", "false")

    await user.click(trigger)
    expect(trigger).toHaveAttribute("aria-expanded", "true")
  })

  it("returns focus to the trigger when Escape closes the menu from an item", async () => {
    const user = userEvent.setup()

    render(<DropdownMenu items={items} triggerVariant="icon" label="Row actions" />)
    const trigger = screen.getByRole("button", { name: "Row actions" })
    await user.click(trigger)

    screen.getByRole("menuitem", { name: /Mark reviewed/ }).focus()
    await user.keyboard("{Escape}")

    expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    expect(document.activeElement).toBe(trigger)
  })

  it("returns focus to the trigger when an item is selected", async () => {
    const user = userEvent.setup()

    render(<DropdownMenu items={items} triggerVariant="icon" label="Row actions" />)
    const trigger = screen.getByRole("button", { name: "Row actions" })
    await user.click(trigger)
    await user.click(screen.getByRole("menuitem", { name: /Mark reviewed/ }))

    expect(document.activeElement).toBe(trigger)
  })

  it("leaves focus alone when a click outside closes the menu", async () => {
    const user = userEvent.setup()

    render(
      <>
        <DropdownMenu items={items} triggerVariant="icon" label="Row actions" />
        <button type="button">Elsewhere</button>
      </>,
    )
    const trigger = screen.getByRole("button", { name: "Row actions" })
    await user.click(trigger)

    const elsewhere = screen.getByRole("button", { name: "Elsewhere" })
    await user.click(elsewhere)

    expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    expect(document.activeElement).toBe(elsewhere)
  })

  /* The flip is decided from the trigger's rect, the menu's height and the
   * nearest clipping ancestor's rect — all three of which jsdom reports as zero,
   * so all three are stubbed. The scroller declares `overflow-y` directly rather
   * than leaning on `overflow-x: auto` computing it, because that computation is
   * a real engine's, not jsdom's. */
  function stubVerticalLayout(options: {
    menuHeight: number
    scroller: { bottom: number; top: number }
    trigger: { bottom: number; top: number }
  }) {
    const originalRect = Element.prototype.getBoundingClientRect
    const rectOf = ({ bottom, top }: { bottom: number; top: number }) =>
      ({ bottom, top, left: 0, right: 200, width: 200, height: bottom - top, x: 0, y: top, toJSON() {} }) as DOMRect

    Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
      if (this instanceof HTMLElement && this.dataset.scroller === "true") {
        return rectOf(options.scroller)
      }
      if (this.tagName === "BUTTON") {
        return rectOf(options.trigger)
      }
      return originalRect.call(this)
    }

    const originalHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight")
    Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
      configurable: true,
      get(this: HTMLElement) {
        return this.getAttribute("role") === "menu" ? options.menuHeight : 0
      },
    })

    return () => {
      Element.prototype.getBoundingClientRect = originalRect
      if (originalHeight) {
        Object.defineProperty(HTMLElement.prototype, "offsetHeight", originalHeight)
      } else {
        delete (HTMLElement.prototype as unknown as Record<string, unknown>).offsetHeight
      }
    }
  }

  function renderInScroller() {
    return render(
      <div data-scroller="true" style={{ overflowY: "auto" }}>
        <DropdownMenu items={items} triggerVariant="icon" label="Row actions" />
      </div>,
    )
  }

  /* The wrapper carrying the offset is the menu's parent — the same element the
   * horizontal clamp shifts. */
  function menuOffsetClasses() {
    return screen.getByRole("menu").parentElement?.className ?? ""
  }

  it("hangs the menu upward when the scroller would clip it below", async () => {
    const user = userEvent.setup()
    window.innerHeight = 768
    restoreRect = stubVerticalLayout({
      menuHeight: 200,
      scroller: { top: 100, bottom: 400 },
      trigger: { top: 360, bottom: 396 },
    })

    renderInScroller()
    await user.click(screen.getByRole("button", { name: "Row actions" }))

    expect(menuOffsetClasses()).toContain("bottom-[calc(100%+0.5rem)]")
    expect(menuOffsetClasses()).not.toContain("top-[calc(100%+0.5rem)]")
  })

  it("leaves the menu below the trigger when it fits there", async () => {
    const user = userEvent.setup()
    window.innerHeight = 768
    restoreRect = stubVerticalLayout({
      menuHeight: 200,
      scroller: { top: 100, bottom: 700 },
      trigger: { top: 120, bottom: 156 },
    })

    renderInScroller()
    await user.click(screen.getByRole("button", { name: "Row actions" }))

    expect(menuOffsetClasses()).toContain("top-[calc(100%+0.5rem)]")
  })

  it("raises the icon trigger to the 44px target only when asked", () => {
    const { unmount } = render(<DropdownMenu items={items} triggerVariant="icon" label="Row actions" />)
    expect(screen.getByRole("button", { name: "Row actions" }).className).toContain("w-9")
    unmount()

    render(<DropdownMenu items={items} triggerVariant="icon" triggerSize="md" label="Row actions" />)
    const raised = screen.getByRole("button", { name: "Row actions" })
    expect(raised.className).toContain("w-11")
    expect(raised.className).toContain("min-h-11")
  })
})
