import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Pagination } from "./pagination.js"

/* jsdom has no layout and no ResizeObserver, so a test that cares about width
 * has to supply both: every element reports `width`, and the observer fires
 * once on observe the way the real one does. */
function stubLayout(width: number) {
  const clientWidth = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(width)

  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(private readonly callback: () => void) {}
      observe() {
        this.callback()
      }
      disconnect() {}
    },
  )

  return () => {
    clientWidth.mockRestore()
    vi.unstubAllGlobals()
  }
}

function pageNumbers() {
  return screen
    .getAllByRole("button", { name: /^Page \d+$/ })
    .map((button) => Number(button.textContent))
}

describe("Pagination", () => {
  let restoreLayout: (() => void) | undefined

  afterEach(() => {
    restoreLayout?.()
    restoreLayout = undefined
  })

  it("anchors on the first and last page so the last one carries the total", () => {
    restoreLayout = stubLayout(320)

    render(<Pagination currentPage={5} totalPages={40} onPageChange={vi.fn()} />)

    const pages = pageNumbers()
    expect(pages[0]).toBe(1)
    expect(pages.at(-1)).toBe(40)
    expect(pages).toContain(5)
  })

  it("shows more pages when the row is wider, and never more than exist", () => {
    restoreLayout = stubLayout(320)
    const { unmount } = render(<Pagination currentPage={5} totalPages={40} onPageChange={vi.fn()} />)
    const narrow = pageNumbers().length
    unmount()
    restoreLayout()

    restoreLayout = stubLayout(900)
    render(<Pagination currentPage={5} totalPages={40} onPageChange={vi.fn()} />)

    expect(pageNumbers().length).toBeGreaterThan(narrow)
  })

  it("never renders more buttons than there are pages", () => {
    restoreLayout = stubLayout(900)

    render(<Pagination currentPage={2} totalPages={3} onPageChange={vi.fn()} />)

    expect(pageNumbers()).toEqual([1, 2, 3])
  })

  it("drops to arrows alone when the row is narrow", () => {
    restoreLayout = stubLayout(320)

    render(<Pagination currentPage={3} totalPages={8} onPageChange={vi.fn()} />)

    expect(screen.getByRole("button", { name: "Previous page" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /^Previous$/ })).not.toBeInTheDocument()
    expect(screen.queryByText(/Page 3/)).not.toBeInTheDocument()
  })

  it("keeps the label and the button text when the row has room", () => {
    restoreLayout = stubLayout(900)

    render(<Pagination currentPage={3} totalPages={8} onPageChange={vi.fn()} />)

    expect(screen.getByRole("button", { name: /^Previous$/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^Next$/ })).toBeInTheDocument()
    expect(screen.getByText(/Page/)).toHaveTextContent("Page 3 of 8")
  })

  it("disables the arrow that has nowhere to go", () => {
    restoreLayout = stubLayout(320)

    render(<Pagination currentPage={1} totalPages={8} onPageChange={vi.fn()} />)

    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled()
  })

  it("renders nothing when there is only one page", () => {
    const { container } = render(<Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />)

    expect(container).toBeEmptyDOMElement()
  })
})
