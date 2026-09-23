import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Skeleton } from "../primitives/skeleton.js"
import { StatCard, StatCardContent } from "./stat-card.js"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("StatCard's value slot", () => {
  /* traps.md §97 in play_2_hire: the value was a <p>, and a Skeleton in it made
   * React warn "<div> cannot be a descendant of <p>" once per tile. */
  it("holds the package's own Skeleton without a nesting warning", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const { container } = render(<StatCard title="New leads" value={<Skeleton className="h-9 w-20" />} />)

    expect(container.querySelector("p div")).toBeNull()
    expect(error).not.toHaveBeenCalled()
  })

  it("renders the figure in a div, in the same place a string goes", () => {
    render(<StatCardContent title="Qualified leads" value="128" />)

    expect(screen.getByText("128").tagName).toBe("DIV")
  })

  it("keeps the title a p, as it always was", () => {
    render(<StatCard title="Qualified leads" value="128" />)

    expect(screen.getByText("Qualified leads").tagName).toBe("P")
  })
})

describe("StatCard's aside", () => {
  it("renders a visual beside the figure when given one", () => {
    render(<StatCard title="Replies" value="412" aside={<span data-testid="spark" />} />)

    const aside = screen.getByTestId("spark").parentElement!
    expect(aside.previousElementSibling!.textContent).toBe("412")
  })

  it("leaves the figure exactly where it was without one", () => {
    const { container } = render(<StatCardContent title="Replies" value="412" />)

    expect(screen.getByText("412").parentElement).toBe(container)
  })
})
