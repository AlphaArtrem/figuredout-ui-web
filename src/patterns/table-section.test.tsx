import { render, screen } from "@testing-library/react"
import { TableSection } from "./table-section.js"

interface Row {
  id: string
  name: string
  status: "active" | "blocked"
}

describe("TableSection", () => {
  it("renders the section heading and empty state", () => {
    render(
      <TableSection<Row>
        title="Paper orders"
        data={[]}
        rowKey={(row) => row.id}
        columns={[{ id: "name", header: "Name", render: (row) => row.name }]}
        emptyState="No orders"
      />,
    )

    expect(screen.getByRole("heading", { name: /paper orders/i })).toBeInTheDocument()
    expect(screen.getByText("No orders")).toBeInTheDocument()
  })

  it("passes row tone rendering through to the table", () => {
    render(
      <TableSection<Row>
        title="Wallets"
        data={[{ id: "wallet-1", name: "Alpha", status: "blocked" }]}
        rowKey={(row) => row.id}
        rowTone={(row) => (row.status === "blocked" ? "warning" : "success")}
        columns={[{ id: "name", header: "Name", render: (row) => row.name }]}
      />,
    )

    expect(screen.getByRole("row", { name: /alpha/i })).toHaveAttribute("data-row-tone", "warning")
  })
})
