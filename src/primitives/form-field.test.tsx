import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { FormField } from "./form-field.js"
import { Input, Select, Textarea } from "./input.js"

describe("FormField", () => {
  /* The bug this pins: the label was emitted with `htmlFor={labelFor}` and
   * nothing else, so the 38 of 86 call sites that omit `labelFor` left their
   * control with no accessible name at all. */
  it("names a control that was never given an explicit labelFor", () => {
    render(
      <FormField label="Assistant name">
        <Input />
      </FormField>,
    )

    expect(screen.getByRole("textbox", { name: "Assistant name" })).toBeTruthy()
  })

  it("names a textarea and a select the same way", () => {
    render(
      <>
        <FormField label="Personality">
          <Textarea />
        </FormField>
        <FormField label="Status">
          <Select>
            <option value="a">A</option>
          </Select>
        </FormField>
      </>,
    )

    expect(screen.getByRole("textbox", { name: "Personality" })).toBeTruthy()
    expect(screen.getByRole("combobox", { name: "Status" })).toBeTruthy()
  })

  it("reaches a control that is nested rather than a direct child", () => {
    render(
      <FormField label="Budget">
        <div className="relative">
          <span aria-hidden="true">$</span>
          <Input type="number" />
        </div>
      </FormField>,
    )

    expect(screen.getByRole("spinbutton", { name: "Budget" })).toBeTruthy()
  })

  /* A field that holds a row of inputs is why the label is referenced rather
   * than copied onto each control: several controls may share one label, and
   * generating an id per field would have duplicated it across them. */
  it("names every control in a field that holds more than one", () => {
    render(
      <FormField label="Portfolio links">
        <Input type="url" />
        <Input type="url" />
      </FormField>,
    )

    expect(screen.getAllByRole("textbox", { name: "Portfolio links" })).toHaveLength(2)
  })

  it("leaves a control that carries its own name alone", () => {
    render(
      <FormField label="Search">
        <Input aria-label="Search leads" />
      </FormField>,
    )

    expect(screen.getByRole("textbox", { name: "Search leads" })).toBeTruthy()
  })

  it("keeps the native association when labelFor is given", () => {
    render(
      <FormField label="Firm name" labelFor="firm-name">
        <Input id="firm-name" />
      </FormField>,
    )

    const input = screen.getByRole("textbox", { name: "Firm name" })
    expect(input.getAttribute("aria-labelledby")).toBeNull()
  })

  it("announces the hint and the error with the control", () => {
    render(
      <FormField label="Exact weight" hint="1–100." error="Must be a number">
        <Input />
      </FormField>,
    )

    const input = screen.getByRole("textbox", { name: "Exact weight" })
    const describedBy = input.getAttribute("aria-describedby") ?? ""
    const described = describedBy.split(" ").map((id) => document.getElementById(id)?.textContent)
    expect(described).toEqual(["1–100.", "Must be a number"])
  })

  it("keeps a description the consumer set as well as the field's own", () => {
    render(
      <>
        <p id="external">Sets every screen's wording</p>
        <FormField label="Entity, singular" hint="e.g. 'Editor'.">
          <Input aria-describedby="external" />
        </FormField>
      </>,
    )

    const input = screen.getByRole("textbox", { name: "Entity, singular" })
    const described = (input.getAttribute("aria-describedby") ?? "")
      .split(" ")
      .map((id) => document.getElementById(id)?.textContent)
    expect(described).toEqual(["Sets every screen's wording", "e.g. 'Editor'."])
  })
})

/* Finding 129: the error was a plain <p> and no control was ever marked
 * invalid, so a wrong password on sign-in was announced and a password
 * mismatch on /admin/account was silent. */
describe("FormField, in error", () => {
  it("announces the error and marks the control invalid", () => {
    render(
      <FormField label="Confirm new password" error="Those passwords don't match.">
        <Input type="text" />
      </FormField>,
    )

    expect(screen.getByRole("alert")).toHaveTextContent("Those passwords don't match.")
    expect(screen.getByRole("textbox", { name: "Confirm new password" })).toHaveAttribute("aria-invalid", "true")
  })

  it("marks a textarea and a select invalid the same way", () => {
    render(
      <>
        <FormField label="Personality" error="Required">
          <Textarea />
        </FormField>
        <FormField label="Status" error="Required">
          <Select>
            <option value="a">A</option>
          </Select>
        </FormField>
      </>,
    )

    expect(screen.getByRole("textbox", { name: "Personality" })).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("combobox", { name: "Status" })).toHaveAttribute("aria-invalid", "true")
  })

  /* The native association is the case that broke on /admin/account: the field
   * publishes no labelId when `labelFor` is set, so `invalid` had to ride a
   * channel that survives that. */
  it("marks the control invalid even when labelFor carries the name", () => {
    render(
      <FormField label="Confirm new password" labelFor="confirm-password" error="Those passwords don't match.">
        <Input id="confirm-password" type="text" />
      </FormField>,
    )

    expect(screen.getByRole("textbox", { name: "Confirm new password" })).toHaveAttribute("aria-invalid", "true")
  })

  it("marks every control in a field that holds more than one", () => {
    render(
      <FormField label="Portfolio links" error="One of these is not a URL">
        <Input type="url" />
        <Input type="url" />
      </FormField>,
    )

    for (const input of screen.getAllByRole("textbox", { name: "Portfolio links" })) {
      expect(input).toHaveAttribute("aria-invalid", "true")
    }
  })

  it("leaves a valid field's control unmarked and the page free of live regions", () => {
    render(
      <FormField label="Firm name" hint="Shown on every screen.">
        <Input />
      </FormField>,
    )

    expect(screen.getByRole("textbox", { name: "Firm name" })).not.toHaveAttribute("aria-invalid")
    expect(screen.queryByRole("alert")).toBeNull()
  })

  it("marks a control that sets invalid itself, with no field error", () => {
    render(
      <FormField label="Weight">
        <Input invalid />
      </FormField>,
    )

    expect(screen.getByRole("textbox", { name: "Weight" })).toHaveAttribute("aria-invalid", "true")
  })

  it("lets a control that states its own validity override the field", () => {
    render(
      <FormField label="Weight" error="Must be a number">
        <Input aria-invalid={false} />
      </FormField>,
    )

    expect(screen.getByRole("textbox", { name: "Weight" })).toHaveAttribute("aria-invalid", "false")
  })
})
