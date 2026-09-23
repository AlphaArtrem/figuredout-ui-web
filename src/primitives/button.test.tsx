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

  /* The icon-only sizes used to be `px-0` passed over Button's `px-3`/`px-4`.
   * `cn` only joins classes, so both utilities reached the element and the
   * stylesheet's order picked `px-3`/`px-4`: every glyph drew at 12px, and at
   * 36px wide at 4px. The square sizes must carry no side padding at all. */
  it.each([
    ["sm", ["w-9", "min-h-9", "rounded-sm"]],
    ["md", ["w-11", "min-h-11", "rounded-md"]],
  ] as const)("draws a %s IconButton square, with no side padding", (size, expected) => {
    render(<IconButton aria-label="Delete row" size={size} icon={<span />} />)

    const classes = screen.getByRole("button", { name: "Delete row" }).className.split(" ")
    expect(classes).toEqual(expect.arrayContaining([...expected]))
    expect(classes.filter((name) => /^px-/.test(name))).toEqual([])
  })

  it("keeps a labelled Button's side padding", () => {
    render(
      <>
        <Button size="sm">Small</Button>
        <Button>Medium</Button>
      </>,
    )

    expect(screen.getByRole("button", { name: "Small" }).className.split(" ")).toContain("px-3")
    expect(screen.getByRole("button", { name: "Medium" }).className.split(" ")).toContain("px-4")
  })

  /* Dashboard redesign live walk, 2026-09-23: at 390px a PageHeader action drew
   * its icon on a line above its label, because a parent's reach made the button
   * a wrapping flex row. The glyph and the label are one line, always. */
  it("keeps its icon and label on one line", () => {
    render(<Button leadingIcon={<span aria-hidden="true" />}>Matching weights</Button>)

    const classes = screen.getByRole("button", { name: "Matching weights" }).className.split(" ")
    expect(classes).toContain("flex-nowrap")
    expect(classes).toContain("whitespace-nowrap")
  })

  it("puts the spinner in the icon's place while an IconButton is loading", () => {
    const { rerender } = render(
      <IconButton aria-label="Send" icon={<span data-testid="glyph" />} />,
    )
    expect(screen.getByTestId("glyph")).toBeTruthy()

    rerender(<IconButton aria-label="Send" loading icon={<span data-testid="glyph" />} />)
    expect(screen.queryByTestId("glyph")).toBeNull()
    expect(screen.getByRole("button", { name: "Send" })).toHaveAttribute("aria-busy", "true")
  })
})
