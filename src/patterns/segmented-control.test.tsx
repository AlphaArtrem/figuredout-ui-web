import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { SegmentedControl } from "./segmented-control.js"
import type { SegmentedControlProps } from "./segmented-control.js"

const OPTIONS = [
  { value: "all", label: "All", count: 47 },
  { value: "mine", label: "Mine", count: 3 },
  { value: "archived", label: "Archived", disabled: true },
  { value: "closed", label: "Closed" },
]

function Harness(props: Partial<SegmentedControlProps>) {
  const [value, setValue] = useState(props.value ?? "all")
  return <SegmentedControl label="Filter" options={OPTIONS} {...props} value={value} onValueChange={setValue} />
}

describe("SegmentedControl", () => {
  it("is a named radiogroup with the chosen segment checked and counts in the names", () => {
    render(<Harness />)

    expect(screen.getByRole("radiogroup", { name: "Filter" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "All 47" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("radio", { name: "Mine 3" })).toHaveAttribute("aria-checked", "false")
  })

  it("is one Tab stop: only the checked segment is tabbable", () => {
    render(<Harness value="mine" />)

    expect(screen.getByRole("radio", { name: /Mine/ })).toHaveAttribute("tabindex", "0")
    expect(screen.getByRole("radio", { name: /All/ })).toHaveAttribute("tabindex", "-1")
  })

  it("moves and selects with the arrows, skipping disabled segments and wrapping", async () => {
    const user = userEvent.setup()
    render(<Harness />)
    screen.getByRole("radio", { name: /All/ }).focus()

    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("radio", { name: /Mine/ })).toHaveFocus()
    expect(screen.getByRole("radio", { name: /Mine/ })).toHaveAttribute("aria-checked", "true")

    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("radio", { name: "Closed" })).toHaveAttribute("aria-checked", "true")

    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("radio", { name: /All/ })).toHaveAttribute("aria-checked", "true")

    await user.keyboard("{End}")
    expect(screen.getByRole("radio", { name: "Closed" })).toHaveFocus()
  })

  it("selects on click", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<SegmentedControl label="Range" value="7d" onValueChange={onValueChange} options={[{ value: "7d", label: "7 days" }, { value: "30d", label: "30 days" }]} />)

    await user.click(screen.getByRole("radio", { name: "30 days" }))

    expect(onValueChange).toHaveBeenCalledWith("30d")
  })

  it("uses aria-pressed toggle buttons, each a Tab stop, in pressed mode", async () => {
    const user = userEvent.setup()
    render(<Harness semantics="pressed" />)

    expect(screen.getByRole("group", { name: "Filter" })).toBeInTheDocument()
    const all = screen.getByRole("button", { name: /All/ })
    expect(all).toHaveAttribute("aria-pressed", "true")
    expect(all).not.toHaveAttribute("tabindex")

    all.focus()
    await user.keyboard("{ArrowRight}")
    /* Arrows move focus but do not press. */
    expect(screen.getByRole("button", { name: /Mine/ })).toHaveFocus()
    expect(screen.getByRole("button", { name: /Mine/ })).toHaveAttribute("aria-pressed", "false")
  })

  it("stretches across its container when fullWidth", () => {
    render(<Harness fullWidth />)

    expect(screen.getByRole("radiogroup").className).toContain("w-full")
  })
})
