import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Section } from "./section.js"

/* Finding 28: the plain variant emitted h2 → eyebrow → description, so the
 * kicker landed between the headline and the copy, while the card variant and
 * PageHeader both led with it. Two reading orders for one design language,
 * decided by which page you landed on.
 *
 * These assert DOCUMENT ORDER rather than a class name, because the order is
 * the fix; the styling is not. `compareDocumentPosition` is the only thing that
 * answers "does this text come first" without depending on the markup around
 * it. */
function comesBefore(first: Element, second: Element) {
  return Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING)
}

describe("Section, plain", () => {
  it("puts the eyebrow before the heading", () => {
    render(
      <Section variant="plain" eyebrow="Pricing" title="Two plans. Both start free.">
        <p>Body</p>
      </Section>,
    )

    const eyebrow = screen.getByText("Pricing")
    const heading = screen.getByRole("heading", { name: "Two plans. Both start free." })
    expect(comesBefore(eyebrow, heading)).toBe(true)
  })

  it("keeps the description after the heading", () => {
    render(
      <Section
        variant="plain"
        eyebrow="Legal"
        title="Privacy"
        description="What we store and why."
      >
        <p>Body</p>
      </Section>,
    )

    const heading = screen.getByRole("heading", { name: "Privacy" })
    const description = screen.getByText("What we store and why.")
    expect(comesBefore(heading, description)).toBe(true)
    expect(comesBefore(screen.getByText("Legal"), heading)).toBe(true)
  })

  it("reads the same way at the display size and with an icon", () => {
    render(
      <Section
        variant="plain"
        size="display"
        icon={<svg data-testid="section-icon" />}
        eyebrow="Questions"
        title="Before you sign up."
      >
        <p>Body</p>
      </Section>,
    )

    const eyebrow = screen.getByText("Questions")
    expect(comesBefore(eyebrow, screen.getByTestId("section-icon"))).toBe(true)
    expect(comesBefore(eyebrow, screen.getByRole("heading", { name: "Before you sign up." }))).toBe(true)
  })

  it("renders no eyebrow node when there is no eyebrow", () => {
    const { container } = render(
      <Section variant="plain" title="Charts">
        <p>Body</p>
      </Section>,
    )

    expect(container.querySelectorAll("p")).toHaveLength(1)
  })
})

/* The variant that was already right. Pinned so the two cannot drift apart
 * again — that drift is the whole of finding 28. */
describe("Section, card", () => {
  it("puts the eyebrow before the heading", () => {
    render(
      <Section eyebrow="Patterns" title="Tables and pagination">
        <p>Body</p>
      </Section>,
    )

    expect(
      comesBefore(screen.getByText("Patterns"), screen.getByRole("heading", { name: "Tables and pagination" })),
    ).toBe(true)
  })
})
