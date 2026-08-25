import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PageContent } from "./page-content.js"

describe("PageContent", () => {
  it("carries the system page gutter so content never meets the viewport edge", () => {
    render(<PageContent data-testid="page">content</PageContent>)

    /* The bug this pins: the component had vertical rhythm (`pb-10`) but no
     * horizontal padding, and `DashboardShell`'s <main> has none either, so
     * every consumer re-added a gutter by hand. */
    expect(screen.getByTestId("page").className).toContain("px-gut")
  })

  it("keeps its own layout classes when a consumer adds more", () => {
    render(
      <PageContent className="mx-auto max-w-[1440px]" data-testid="page">
        content
      </PageContent>,
    )

    const className = screen.getByTestId("page").className
    expect(className).toContain("px-gut")
    expect(className).toContain("flex flex-col gap-6")
    expect(className).toContain("mx-auto max-w-[1440px]")
  })
})
