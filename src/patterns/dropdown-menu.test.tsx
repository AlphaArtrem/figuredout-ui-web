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
})
