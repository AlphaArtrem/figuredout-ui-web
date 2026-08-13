import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SeamGrid, seamCorners } from "./seam-grid.js"

describe("seamCorners", () => {
  it("rounds only the four corners of the frame", () => {
    // Four cells in two columns: 0 and 1 are the top row, 2 and 3 the bottom.
    const corners = [0, 1, 2, 3].map((index) => seamCorners(index, 4, { base: 2 }))

    expect(corners[0]).toContain("rounded-tl-xl")
    expect(corners[0]).not.toContain("rounded-br-xl")
    expect(corners[1]).toContain("rounded-tr-xl")
    expect(corners[2]).toContain("rounded-bl-xl")
    expect(corners[3]).toContain("rounded-br-xl")
  })

  it("gives a single cell all four corners", () => {
    const only = seamCorners(0, 1, { base: 1 })

    for (const corner of ["rounded-tl-xl", "rounded-tr-xl", "rounded-bl-xl", "rounded-br-xl"]) {
      expect(only).toContain(corner)
    }
  })

  it("re-rounds per breakpoint, so a cell that is a corner at one width is not at another", () => {
    // Cell 1 of four: the top-right corner in a single column it is not, in two
    // columns it is, and in four columns it is not again.
    const cell = seamCorners(1, 4, { base: 1, sm: 2, lg: 4 })

    expect(cell).toContain("sm:rounded-tr-xl")
    expect(cell).not.toContain("lg:rounded-tr-xl")
    // Every breakpoint resets first, so a stale corner cannot survive a step.
    expect(cell).toContain("rounded-none")
    expect(cell).toContain("sm:rounded-none")
    expect(cell).toContain("lg:rounded-none")
  })
})

describe("SeamGrid", () => {
  it("puts the surface, padding and corners on the cells it is given", () => {
    render(
      <SeamGrid columns={2}>
        <div data-testid="first">First</div>
        <div data-testid="second">Second</div>
      </SeamGrid>,
    )

    const first = screen.getByTestId("first")

    expect(first.className).toContain("bg-surface")
    expect(first.className).toContain("rounded-tl-xl")
    // The caller's own classes survive.
    expect(screen.getByTestId("second")).toBeInTheDocument()
  })

  it("keeps a cell's own className", () => {
    render(
      <SeamGrid columns={2}>
        <div data-testid="cell" className="text-danger">
          Cell
        </div>
        <div>Other</div>
      </SeamGrid>,
    )

    expect(screen.getByTestId("cell").className).toContain("text-danger")
  })
})
