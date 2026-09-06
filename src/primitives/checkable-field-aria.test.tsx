import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Checkbox } from "./checkbox.js"
import { FormField } from "./form-field.js"
import { Switch } from "./switch.js"

/* The gap this pins: `Checkbox` and `Switch` were the only field controls that
 * did not read `FormField`'s context, so a checkable control inside a required
 * or invalid field said nothing about either. The asterisk is `aria-hidden`
 * now, so there was nothing else left to say it. */
describe("Checkbox and Switch inside a FormField", () => {
  it("reports the field's required state", () => {
    render(
      <>
        <FormField label="Terms" required>
          <Checkbox />
        </FormField>
        <FormField label="Live" required>
          <Switch />
        </FormField>
      </>,
    )

    expect(screen.getByRole("checkbox", { name: "Terms" })).toHaveAttribute("aria-required", "true")
    expect(screen.getByRole("checkbox", { name: "Live" })).toHaveAttribute("aria-required", "true")
  })

  it("reports the field's invalid state and is described by its error", () => {
    render(
      <FormField label="Terms" error="You have to accept these.">
        <Checkbox />
      </FormField>,
    )

    const box = screen.getByRole("checkbox", { name: "Terms" })
    expect(box).toHaveAttribute("aria-invalid", "true")
    expect(box.getAttribute("aria-describedby")).toBeTruthy()
    expect(screen.getByRole("alert").id).toBe(box.getAttribute("aria-describedby"))
  })

  /* The other direction, and the reason this is a second hook and not one more
   * caller of `useFieldAria`: `aria-labelledby` outranks a local label, so a
   * control that already has a name must keep it. */
  it("keeps a name of its own rather than taking the field's", () => {
    render(
      <FormField label="Weighting" required>
        <>
          <Switch label="Hard filter" />
          <Checkbox aria-label="Searchable" />
          <Checkbox id="notify" />
          <label htmlFor="notify">Notify the team</label>
        </>
      </FormField>,
    )

    expect(screen.getByRole("checkbox", { name: "Hard filter" })).toHaveAttribute("aria-required", "true")
    expect(screen.getByRole("checkbox", { name: "Searchable" })).toHaveAttribute("aria-required", "true")
    expect(screen.getByRole("checkbox", { name: "Notify the team" })).toHaveAttribute("aria-required", "true")
    expect(screen.queryByRole("checkbox", { name: "Weighting" })).toBeNull()
  })

  it("changes nothing for a checkable control that has no field around it", () => {
    render(<Checkbox aria-label="Standalone" />)

    const box = screen.getByRole("checkbox", { name: "Standalone" })
    expect(box).not.toHaveAttribute("aria-required")
    expect(box).not.toHaveAttribute("aria-invalid")
    expect(box).not.toHaveAttribute("aria-labelledby")
  })
})
