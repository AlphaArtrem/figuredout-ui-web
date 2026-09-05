import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PageHeader } from "./page-header.js"

/* jsdom has no layout and no Tailwind stylesheet, so what is provable here is
 * the GRID PLACEMENT the responsive rule is built out of: the actions share row
 * 1 with the title and the description is on row 2 beneath it, which is the
 * whole of finding 12's fix. Where those cells land at 390 and at 1440 is
 * measured in the running app, not here. */
describe("PageHeader action placement (finding 12)", () => {
  it("puts the actions on the title's row, not under the description", () => {
    render(
      <PageHeader
        title="Editors"
        description="Every editor available for matching."
        actions={<button type="button">Add editor</button>}
      />,
    )

    const action = screen.getByRole("button", { name: "Add editor" }).parentElement
    expect(action?.className).toContain("row-start-1")
    expect(action?.className).toContain("col-start-2")

    const description = screen.getByText("Every editor available for matching.")
    expect(description.className).toContain("row-start-2")
    expect(description.className).toContain("col-start-1")
  })

  it("keeps the wide layout: the actions span both rows and sit at the bottom from lg up", () => {
    render(<PageHeader title="Editors" description="Copy." actions={<button type="button">Add</button>} />)

    const action = screen.getByRole("button", { name: "Add" }).parentElement
    expect(action?.className).toContain("lg:row-span-2")
    expect(action?.className).toContain("lg:self-end")
  })

  it("caps the action column below lg so a wide action set cannot squeeze the title out", () => {
    const { container } = render(
      <PageHeader title="What needs you right now" actions={<button type="button">Go to Inbox</button>} />,
    )

    const header = container.firstElementChild
    expect(header?.className).toContain("grid-cols-[minmax(0,1fr)_minmax(0,45%)]")
    expect(header?.className).toContain("lg:grid-cols-[minmax(0,1fr)_auto]")
  })

  it("gives the description the whole row below lg, and column one from lg up", () => {
    render(<PageHeader title="Editors" description="Copy." actions={<button type="button">Add</button>} />)

    const description = screen.getByText("Copy.")
    expect(description.className).toContain("col-span-2")
    expect(description.className).toContain("lg:col-span-1")
  })

  it("does not spend a column gap on a header with nothing beside the title", () => {
    const { container } = render(<PageHeader title="Settings" description="Copy." />)

    const header = container.firstElementChild
    expect(header?.className).toContain("grid-cols-[minmax(0,1fr)]")
    expect(header?.className).not.toContain("gap-x-4")
  })

  it("still renders one h1, and the eyebrow above it", () => {
    render(<PageHeader eyebrow="Today" title="What needs you right now" />)

    const heading = screen.getByRole("heading", { level: 1 })
    expect(heading).toHaveTextContent("What needs you right now")
    expect(heading.compareDocumentPosition(screen.getByText("Today")) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy()
  })
})
