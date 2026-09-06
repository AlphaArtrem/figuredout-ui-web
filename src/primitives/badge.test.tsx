import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Badge } from "./badge.js"

describe("Badge", () => {
  /* The bug this pins: review finding 14. `Badge` had no `whitespace-nowrap`,
   * so in a narrow table column a two-word status broke over two lines inside
   * its own pill and rendered 40px tall against a 24px badge. Two consumers
   * had already reached for a local `className` workaround. */
  it("does not wrap a multi-word label", () => {
    render(<Badge>In Conversation</Badge>)

    expect(screen.getByText("In Conversation").className).toContain("whitespace-nowrap")
  })

  it("keeps the tone ring and still merges a call site's own classes", () => {
    render(
      <Badge tone="success" className="self-start">
        Matched
      </Badge>,
    )

    const badge = screen.getByText("Matched")
    expect(badge.className).toContain("whitespace-nowrap")
    expect(badge.className).toContain("ring-success/30")
    expect(badge.className).toContain("self-start")
  })
})
