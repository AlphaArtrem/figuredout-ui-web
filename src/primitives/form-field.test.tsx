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
