import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Button, IconButton } from "./button.js"

describe("Button", () => {
  /* Finding 89: `loading` set `disabled` and swapped in a spinning icon marked
   * `aria-hidden`, and nothing else. A screen-reader user heard the control go
   * from actionable to dimmed with no statement that anything was happening —
   * on every form in the product. */
  it("marks itself busy and says so while loading", () => {
    render(<Button loading>Save</Button>)

    const button = screen.getByRole("button", { name: /Save/ })
    expect(button).toHaveAttribute("aria-busy", "true")
    expect(button).toBeDisabled()
    expect(screen.getByRole("status")).toHaveTextContent("Loading")
  })

  it("appends the pending state to the accessible name rather than replacing it", () => {
    render(<Button loading loadingLabel="Saving">Save profile</Button>)

    expect(screen.getByRole("button", { name: "Save profile Saving" })).toBeTruthy()
  })

  it("is neither busy nor a live region when it is not loading", () => {
    render(<Button>Save</Button>)

    expect(screen.getByRole("button", { name: "Save" })).not.toHaveAttribute("aria-busy")
    expect(screen.queryByRole("status")).toBeNull()
  })

  it("is primary when no variant is given", () => {
    render(<Button>Save</Button>)

    const button = screen.getByRole("button", { name: "Save" })
    expect(button.className).toContain("bg-primary text-primary-fg")
    expect(button.className).not.toContain("warning")
  })

  /* play_2_hire future-scope §27.2: Impersonate is consequential rather than
   * destructive, and `primary` was the only variant between secondary and red. */
  it("has a warning variant: the warning wash, the warning ink and a warning ring", () => {
    render(<Button variant="warning">Impersonate</Button>)

    const button = screen.getByRole("button", { name: "Impersonate" })
    expect(button.className).toContain("bg-warning-soft")
    expect(button.className).toContain("text-warning")
    expect(button.className).toContain("ring-warning/40")
    expect(button.className).not.toContain("bg-danger")
    expect(button.className).not.toContain("bg-primary")
  })

  it("keeps an IconButton's own name and still reports busy", () => {
    render(<IconButton aria-label="Delete row" loading icon={<span />} />)

    const button = screen.getByRole("button", { name: "Delete row" })
    expect(button).toHaveAttribute("aria-busy", "true")
    expect(screen.getByRole("status")).toHaveTextContent("Loading")
  })
})
