import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import { Table } from "./table.js"
import type { TableColumn } from "./table.js"

interface Row {
  id: string
  name: string
  status: string
}

const ROWS: Row[] = [
  { id: "b", name: "Bravo", status: "Active" },
  { id: "a", name: "Alfa", status: "Paused" },
]

const COLUMNS: TableColumn<Row>[] = [
  { id: "name", header: "Name", render: (row) => row.name, sortValue: (row) => row.name },
  { id: "status", header: "Status", render: (row) => row.status },
]

/* jsdom reports every layout box as zero, so the overflow measurement has to be
 * fed. Both properties are read-only accessors on the prototype; redefining them
 * for the length of a test is the only way to say "this table is wider than its
 * box" without a real layout engine. */
const sizeOverrides: string[] = []

function stubLayout({ scrollWidth, clientWidth }: { scrollWidth: number; clientWidth: number }) {
  for (const [property, value] of [
    ["scrollWidth", scrollWidth],
    ["clientWidth", clientWidth],
  ] as const) {
    Object.defineProperty(HTMLDivElement.prototype, property, { configurable: true, value })
    sizeOverrides.push(property)
  }
}

afterEach(() => {
  for (const property of sizeOverrides.splice(0)) {
    Reflect.deleteProperty(HTMLDivElement.prototype, property)
  }
})

describe("Table — the horizontal scroll region (finding 122)", () => {
  it("is a focusable, named region while the table is wider than its box", () => {
    stubLayout({ scrollWidth: 843, clientWidth: 342 })

    render(<Table columns={COLUMNS} data={ROWS} rowKey={(row) => row.id} label="Editors" />)

    const region = screen.getByRole("region", { name: "Editors" })
    expect(region).toHaveAttribute("tabindex", "0")
    // Named by the table's own caption, not by a repeated string.
    const caption = document.querySelector("caption")
    expect(caption).not.toBeNull()
    expect(region.getAttribute("aria-labelledby")).toBe(caption?.id)
    expect(caption).toHaveTextContent("Editors")
  })

  it("takes focus when it is asked to, which is what arrow-key scrolling needs", () => {
    stubLayout({ scrollWidth: 843, clientWidth: 342 })

    render(<Table columns={COLUMNS} data={ROWS} rowKey={(row) => row.id} label="Editors" />)

    const region = screen.getByRole("region", { name: "Editors" })
    region.focus()
    expect(document.activeElement).toBe(region)
  })

  it("is neither a landmark nor a tab stop when the table fits", () => {
    stubLayout({ scrollWidth: 342, clientWidth: 342 })

    render(<Table columns={COLUMNS} data={ROWS} rowKey={(row) => row.id} label="Editors" />)

    expect(screen.queryByRole("region")).toBeNull()
    expect(document.querySelector("[tabindex]")).toBeNull()
    // The caption still names the table itself.
    expect(document.querySelector("caption")).toHaveTextContent("Editors")
  })

  it("does not announce an unnamed region when no label was passed", () => {
    stubLayout({ scrollWidth: 843, clientWidth: 342 })

    render(<Table columns={COLUMNS} data={ROWS} rowKey={(row) => row.id} />)

    expect(screen.queryByRole("region")).toBeNull()
    expect(document.querySelector("caption")).toBeNull()
  })
})

describe("Table — header case (finding 76)", () => {
  it("gives every header in the row one text-transform, sortable or not", () => {
    render(<Table columns={COLUMNS} data={ROWS} rowKey={(row) => row.id} />)

    const headers = screen.getAllByRole("columnheader")
    expect(headers).toHaveLength(2)
    for (const header of headers) {
      expect(header.className).toContain("normal-case")
      expect(header.className).not.toContain("uppercase")
    }
    // The two conventions were "a button resets text-transform" versus "the th
    // shouts", so the sortable one has to still be a button for this to mean
    // anything.
    expect(within(headers[0]!).getByRole("button", { name: /Name/ })).toBeTruthy()
    expect(within(headers[1]!).queryByRole("button")).toBeNull()
  })

  it("leaves the header text itself untouched", () => {
    render(<Table columns={COLUMNS} data={ROWS} rowKey={(row) => row.id} />)

    expect(screen.getByText("Status").textContent).toBe("Status")
  })
})

describe("Table — sorting still works", () => {
  it("sorts on the first sortable column and reverses on a second press", async () => {
    const user = userEvent.setup()
    render(<Table columns={COLUMNS} data={ROWS} rowKey={(row) => row.id} label="Editors" />)

    const firstCell = () => document.querySelectorAll("tbody tr td")[0]?.textContent
    expect(firstCell()).toBe("Alfa")

    await user.click(screen.getByRole("button", { name: /Name/ }))
    expect(firstCell()).toBe("Bravo")
    expect(screen.getAllByRole("columnheader")[0]).toHaveAttribute("aria-sort", "descending")
  })
})
