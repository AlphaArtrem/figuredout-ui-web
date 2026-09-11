import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Card } from "./card.js"

/* `titleAs` is opt-in. The default has to stay a `div`: a card is not a heading
 * by design, and turning every card title into one would put dozens of
 * unplanned headings into every consumer's outline (findings 53 and 116). */
describe("Card title", () => {
  it("renders the title in a div, not a heading, by default", () => {
    const { container } = render(<Card title="Current plan">Body</Card>)

    expect(screen.queryByRole("heading")).toBeNull()
    const title = screen.getByText("Current plan")
    expect(title.tagName).toBe("DIV")
    expect(title.className).toBe("text-sm font-semibold text-fg")
    expect(container.querySelectorAll("h1, h2, h3, h4, h5, h6")).toHaveLength(0)
  })

  it("renders the title as the heading it is asked for, with the same look", () => {
    render(
      <Card title="Current plan" titleAs="h3">
        Body
      </Card>,
    )

    const heading = screen.getByRole("heading", { level: 3, name: "Current plan" })
    expect(heading.tagName).toBe("H3")
    expect(heading.className).toBe("m-0 text-sm font-semibold text-fg")
  })

  it("says nothing about a heading when there is no title", () => {
    const { container } = render(<Card titleAs="h2">Body</Card>)

    expect(screen.queryByRole("heading")).toBeNull()
    expect(container.querySelectorAll("h2")).toHaveLength(0)
  })
})
