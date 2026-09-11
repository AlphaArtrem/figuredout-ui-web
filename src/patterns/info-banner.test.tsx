import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { InfoBanner } from "./info-banner.js"

/* jsdom has no layout, so these pin the grid placement that produces the
 * layout; the heights at 390 are measured in the consuming app. */
describe("InfoBanner's actions", () => {
  it("sit under the text below sm and beside it from sm", () => {
    render(
      <InfoBanner
        tone="warning"
        title="Confirm your email address"
        description="We sent you a link when you signed up."
        actions={
          <>
            <button type="button">Resend email</button>
            <button type="button">1 more</button>
          </>
        }
      />,
    )

    const banner = screen.getByRole("alert")
    expect(banner.className).toContain("grid-cols-[auto_minmax(0,1fr)]")
    expect(banner.className).toContain("sm:grid-cols-[auto_minmax(0,1fr)_auto]")

    const actions = screen.getByRole("button", { name: "Resend email" }).parentElement!
    // Row two, under the text column, below sm…
    expect(actions.className).toContain("col-start-2")
    // …and the third column of row one from sm.
    expect(actions.className).toContain("sm:col-start-3")
    expect(actions.className).toContain("sm:row-start-1")
    // Several controls wrap in a row rather than needing a caller-side stack.
    expect(actions.className).toContain("flex-wrap")
    expect(actions).toContainElement(screen.getByRole("button", { name: "1 more" }))
  })

  it("adds no third column when there are no actions, so the text keeps its width", () => {
    render(<InfoBanner tone="info" title="No test message here" />)

    const banner = screen.getByRole("status")
    expect(banner.className).not.toContain("_auto]")
    expect(banner.className).not.toContain("gap-y-3")
  })

  it("keeps its roles: alert for warning and danger, status otherwise", () => {
    render(
      <>
        <InfoBanner tone="danger" title="Payment failed" />
        <InfoBanner tone="success" title="Connected" />
      </>,
    )

    expect(screen.getByRole("alert")).toHaveTextContent("Payment failed")
    expect(screen.getByRole("status")).toHaveTextContent("Connected")
  })
})
