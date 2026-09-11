import { fireEvent, render, screen } from "@testing-library/react"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { FormField } from "./form-field.js"
import { NumberField } from "./number-field.js"
import type { NumberFieldProps } from "./number-field.js"

/* A controlled harness: the component never holds the value itself, so every
 * test goes through the same `value` / `onValueChange` round trip a caller does. */
function Controlled({
  initial = 3,
  spy,
  ...props
}: Partial<NumberFieldProps> & { initial?: number; spy?: (next: number) => void }) {
  const [value, setValue] = useState(initial)
  return (
    <NumberField
      min={1}
      max={5}
      {...props}
      value={value}
      onValueChange={(next) => {
        spy?.(next)
        setValue(next)
      }}
    />
  )
}

describe("NumberField", () => {
  it("is a labelled numeric spin button that states its bounds", () => {
    render(<Controlled label="Retries" />)

    const input = screen.getByRole("spinbutton", { name: "Retries" })
    expect(input).toHaveAttribute("inputmode", "numeric")
    expect(input).toHaveAttribute("aria-valuenow", "3")
    expect(input).toHaveAttribute("aria-valuemin", "1")
    expect(input).toHaveAttribute("aria-valuemax", "5")
  })

  it("names both buttons after the field", () => {
    render(<Controlled label="Retries" />)

    expect(screen.getByRole("button", { name: "Decrease Retries" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Increase Retries" })).toBeTruthy()
  })

  it("lets a caller word the verbs", () => {
    render(<Controlled label="Retries" decreaseLabel="Fewer" increaseLabel="More" />)

    expect(screen.getByRole("button", { name: "Fewer Retries" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "More Retries" })).toBeTruthy()
  })

  it("gives both buttons a 44 x 44 target", () => {
    render(<Controlled label="Retries" />)

    for (const button of screen.getAllByRole("button")) {
      expect(button.className).toContain("min-h-11")
      expect(button.className).toContain("w-11")
    }
  })

  it("steps by one and disables the button at its bound", () => {
    const spy = vi.fn()
    render(<Controlled label="Retries" initial={4} spy={spy} />)

    const increase = screen.getByRole("button", { name: "Increase Retries" })
    fireEvent.click(increase)

    expect(spy).toHaveBeenCalledWith(5)
    expect(screen.getByRole("spinbutton")).toHaveAttribute("aria-valuenow", "5")
    expect(increase).toBeDisabled()
    expect(screen.getByRole("button", { name: "Decrease Retries" })).not.toBeDisabled()
  })

  it("starts with the decrease button disabled at the lower bound", () => {
    render(<Controlled label="Retries" initial={1} />)

    expect(screen.getByRole("button", { name: "Decrease Retries" })).toBeDisabled()
  })

  /* The pressed button is about to be disabled, and a disabled button drops
   * focus to the document. */
  it("moves focus to the input when a press reaches the bound", () => {
    render(<Controlled label="Retries" initial={4} />)

    fireEvent.click(screen.getByRole("button", { name: "Increase Retries" }))

    expect(document.activeElement).toBe(screen.getByRole("spinbutton"))
  })

  it("clamps a typed value, and shows the kept value once the field is left", () => {
    render(<Controlled label="Retries" />)

    const input = screen.getByRole("spinbutton") as HTMLInputElement
    fireEvent.change(input, { target: { value: "9" } })
    expect(input).toHaveAttribute("aria-valuenow", "5")

    fireEvent.blur(input)
    expect(input.value).toBe("5")
  })

  it("leaves a half-typed value alone instead of snapping it to a bound", () => {
    const spy = vi.fn()
    render(<Controlled label="Retries" spy={spy} />)

    const input = screen.getByRole("spinbutton") as HTMLInputElement
    fireEvent.change(input, { target: { value: "" } })

    expect(spy).not.toHaveBeenCalled()
    expect(input.value).toBe("")

    fireEvent.blur(input)
    expect(input.value).toBe("3")
  })

  it("steps with the arrow keys and jumps to the bounds with Home and End", () => {
    render(<Controlled label="Retries" />)

    const input = screen.getByRole("spinbutton")
    fireEvent.keyDown(input, { key: "ArrowUp" })
    expect(input).toHaveAttribute("aria-valuenow", "4")
    fireEvent.keyDown(input, { key: "ArrowDown" })
    fireEvent.keyDown(input, { key: "ArrowDown" })
    expect(input).toHaveAttribute("aria-valuenow", "2")
    fireEvent.keyDown(input, { key: "End" })
    expect(input).toHaveAttribute("aria-valuenow", "5")
    fireEvent.keyDown(input, { key: "Home" })
    expect(input).toHaveAttribute("aria-valuenow", "1")
  })

  it("disables all three controls when disabled", () => {
    render(<Controlled label="Retries" disabled />)

    expect(screen.getByRole("spinbutton")).toBeDisabled()
    for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled()
  })
})

describe("NumberField inside a FormField", () => {
  it("takes the field's name, required and invalid state on the input", () => {
    render(
      <FormField label="Max retries" required error="Too many">
        <Controlled />
      </FormField>,
    )

    const input = screen.getByRole("spinbutton", { name: "Max retries" })
    expect(input).toHaveAttribute("aria-required", "true")
    expect(input).toHaveAttribute("aria-invalid", "true")
    const described = (input.getAttribute("aria-describedby") ?? "")
      .split(" ")
      .map((id) => document.getElementById(id)?.textContent)
    expect(described).toContain("Too many")
  })

  /* traps.md §80: inheriting the field's name onto the parts would announce
   * both buttons as "Max retries". They are built from it instead. */
  it("names its buttons from the field's words without taking the field's name", () => {
    render(
      <FormField label="Max retries" required>
        <Controlled />
      </FormField>,
    )

    expect(screen.getByRole("button", { name: "Decrease Max retries" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Increase Max retries" })).toBeTruthy()
    expect(screen.queryByRole("button", { name: "Max retries" })).toBeNull()
  })

  it("still names its buttons when labelFor carries the input's name natively", () => {
    render(
      <FormField label="Max retries" labelFor="retries">
        <Controlled id="retries" />
      </FormField>,
    )

    expect(screen.getByRole("spinbutton", { name: "Max retries" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Decrease Max retries" })).toBeTruthy()
  })

  it("prefers its own label over the field's", () => {
    render(
      <FormField label="Limits">
        <Controlled label="Retries" />
      </FormField>,
    )

    expect(screen.getByRole("spinbutton", { name: "Retries" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Increase Retries" })).toBeTruthy()
  })
})
