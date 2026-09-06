import { useState } from "react"
import userEvent from "@testing-library/user-event"
import { render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { FormField } from "../primitives/form-field.js"
import { TagPicker } from "./tag-picker.js"
import type { TagPickerProps } from "./tag-picker.js"

const NICHES = [
  { label: "Gaming", value: "Gaming" },
  { label: "Lifestyle", value: "Lifestyle" },
  { label: "Education", value: "Education" },
  { label: "Tech & Gadgets", value: "Tech & Gadgets" },
  { label: "Food & Cooking", value: "Food & Cooking" },
]

/* Driven rather than asserted on a static `value`, because every criterion in
 * review finding 01 is about a sequence — type, filter, pick, see the count. */
function Harness({
  initial = [],
  ...props
}: { initial?: string[] } & Omit<TagPickerProps, "value" | "onChange"> & {
  onChange?: (values: string[]) => void
}) {
  const [value, setValue] = useState<string[]>(initial)
  return (
    <TagPicker
      {...props}
      value={value}
      onChange={(next) => {
        setValue(next)
        props.onChange?.(next)
      }}
    />
  )
}

describe("TagPicker", () => {
  /* Finding 80: 28 checkboxes with no fieldset, legend or role="group" anywhere
   * on the page, so an option announced with nothing saying which question it
   * answered. The group's name is the field's name — the control does not take
   * a label prop of its own inside a FormField. */
  it("is a group named by the FormField around it", async () => {
    const user = userEvent.setup()

    render(
      <FormField label="Work Type" required>
        <Harness options={NICHES} placeholder="Search work types…" />
      </FormField>,
    )

    expect(screen.getByRole("group", { name: "Work Type" })).toBeInTheDocument()

    const combobox = screen.getByRole("combobox", { name: "Work Type" })
    expect(combobox).toHaveAttribute("aria-required", "true")

    await user.click(combobox)
    expect(screen.getByRole("listbox", { name: "Work Type" })).toBeInTheDocument()
  })

  it("takes its own label when there is no field around it", () => {
    render(<Harness label="Niche" options={NICHES} />)

    expect(screen.getByRole("group", { name: "Niche" })).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: "Niche" })).toBeInTheDocument()
  })

  /* Finding 129, carried forward: an invalid field has to be reported on the
   * control the user is focused on, not only in the sentence below it. */
  it("reports the field's invalid state and its error", () => {
    render(
      <FormField label="Niche" error="Pick at least one.">
        <Harness options={NICHES} />
      </FormField>,
    )

    const combobox = screen.getByRole("combobox", { name: "Niche" })
    expect(combobox).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("alert").id).toBe(combobox.getAttribute("aria-describedby"))
  })

  /* Finding 01, first half: no search. */
  it("filters the options as the query is typed", async () => {
    const user = userEvent.setup()

    render(<Harness label="Niche" options={NICHES} />)

    await user.click(screen.getByRole("combobox"))
    expect(screen.getAllByRole("option")).toHaveLength(5)

    await user.keyboard("ga")

    const visible = screen.getAllByRole("option").map((option) => option.textContent)
    expect(visible).toEqual(["Gaming", "Tech & Gadgets"])
  })

  it("says so when nothing matches", async () => {
    const user = userEvent.setup()

    render(<Harness label="Niche" options={NICHES} emptyMessage="Nothing in this group matches." />)

    await user.click(screen.getByRole("combobox"))
    await user.keyboard("zzz")

    expect(screen.queryAllByRole("option")).toHaveLength(0)
    expect(screen.getByText("Nothing in this group matches.")).toBeInTheDocument()
  })

  /* Finding 01, second half: the selection could not be read without re-reading
   * every option. Chips and a count both, because chips wrap and a count does
   * not. */
  it("states the selection as chips and as a count", async () => {
    const user = userEvent.setup()

    render(<Harness label="Niche" initial={["Gaming", "Lifestyle", "Education"]} options={NICHES} />)

    expect(screen.getByText("3 of 5 selected")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Remove Gaming" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Remove Lifestyle" }))

    expect(screen.getByText("2 of 5 selected")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Remove Lifestyle" })).toBeNull()
  })

  it("selects and deselects from the keyboard alone", async () => {
    const user = userEvent.setup()

    render(<Harness label="Niche" options={NICHES} />)

    await user.tab()
    expect(screen.getByRole("combobox")).toHaveFocus()

    await user.keyboard("{ArrowDown}")
    const listbox = screen.getByRole("listbox")
    expect(within(listbox).getAllByRole("option")[1]).toHaveAttribute("data-active", "true")

    await user.keyboard("{Enter}")
    expect(screen.getByText("1 of 5 selected")).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Lifestyle" })).toHaveAttribute("aria-selected", "true")

    /* Enter on an already-selected row removes it — the same gesture both ways,
     * which is what makes a correction cheap. */
    await user.keyboard("{Enter}")
    expect(screen.getByText("0 of 5 selected")).toBeInTheDocument()
  })

  it("points aria-activedescendant at the row it moved to", async () => {
    const user = userEvent.setup()

    render(<Harness label="Niche" options={NICHES} />)

    await user.click(screen.getByRole("combobox"))
    await user.keyboard("{ArrowDown}{ArrowDown}")

    const active = screen.getByRole("combobox").getAttribute("aria-activedescendant")
    expect(active).toBeTruthy()
    expect(document.getElementById(active as string)?.textContent).toBe("Education")
  })

  it("removes the last chip on Backspace in an empty query, and closes on Escape", async () => {
    const user = userEvent.setup()

    render(<Harness label="Niche" initial={["Gaming", "Lifestyle"]} options={NICHES} />)

    await user.click(screen.getByRole("combobox"))
    await user.keyboard("{Backspace}")

    expect(screen.queryByRole("button", { name: "Remove Lifestyle" })).toBeNull()
    expect(screen.getByRole("button", { name: "Remove Gaming" })).toBeInTheDocument()

    await user.keyboard("{Escape}")
    expect(screen.queryByRole("listbox")).toBeNull()
  })

  it("clears everything from the Clear all control", async () => {
    const user = userEvent.setup()

    render(<Harness label="Niche" initial={["Gaming", "Lifestyle"]} options={NICHES} />)

    await user.click(screen.getByRole("button", { name: "Clear all" }))

    expect(screen.getByText("0 of 5 selected")).toBeInTheDocument()
  })

  /* Finding 01, third half and the reason this is worth a primitive: adding a
   * missing option meant leaving a half-filled form. The package must not know
   * where options come from, so the call site hands in a callback. */
  it("offers a create row for a query with no exact match and calls back with it", async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn().mockResolvedValue("Woodworking")

    render(<Harness label="Niche" options={NICHES} onCreate={onCreate} />)

    await user.click(screen.getByRole("combobox"))
    await user.keyboard("Woodworking")

    const createRow = screen.getByRole("option", { name: /Add “Woodworking”/ })
    await user.click(createRow)

    expect(onCreate).toHaveBeenCalledWith("Woodworking")
    expect(await screen.findByRole("button", { name: "Remove Woodworking" })).toBeInTheDocument()
  })

  it("reaches the create row from the keyboard, past the end of the matches", async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn().mockResolvedValue(undefined)

    render(<Harness label="Niche" options={NICHES} onCreate={onCreate} />)

    await user.click(screen.getByRole("combobox"))
    await user.keyboard("Gami")

    /* One match ("Gaming"), then the create row. */
    await user.keyboard("{ArrowDown}{Enter}")

    expect(onCreate).toHaveBeenCalledWith("Gami")
  })

  it("does not offer to create an option that already exists, or one with no callback", async () => {
    const user = userEvent.setup()

    const { unmount } = render(<Harness label="Niche" options={NICHES} onCreate={vi.fn()} />)
    await user.click(screen.getByRole("combobox"))
    await user.keyboard("Gaming")
    expect(screen.queryByRole("option", { name: /^Add/ })).toBeNull()
    unmount()

    render(<Harness label="Niche" options={NICHES} />)
    await user.click(screen.getByRole("combobox"))
    await user.keyboard("Woodworking")
    expect(screen.queryByRole("option", { name: /^Add/ })).toBeNull()
  })

  it("lets the call site name the create row in its own words", async () => {
    const user = userEvent.setup()

    render(
      <Harness
        label="Niche"
        options={NICHES}
        onCreate={vi.fn()}
        createLabel={(query) => `Add “${query}” as a new Niche`}
      />,
    )

    await user.click(screen.getByRole("combobox"))
    await user.keyboard("Woodworking")

    expect(screen.getByRole("option", { name: "Add “Woodworking” as a new Niche" })).toBeInTheDocument()
  })

  it("never selects a disabled option", async () => {
    const user = userEvent.setup()

    render(
      <Harness
        label="Niche"
        options={[...NICHES, { label: "Retired", value: "Retired", disabled: true }]}
      />,
    )

    await user.click(screen.getByRole("combobox"))
    await user.click(screen.getByRole("option", { name: "Retired" }))

    expect(screen.getByText("0 of 6 selected")).toBeInTheDocument()
  })
})
