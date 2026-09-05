import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { LoadingRegion } from "./loading-region.js"
import { Skeleton } from "./skeleton.js"

/* Finding 61: measured on `/leads`, `/inbox` and `/analytics` during a driven
 * 45-second delay, the count of `[aria-live]`, `[role="status"]` and
 * `[aria-busy]` elements on the page was zero. Every one of those pages was
 * built out of `Skeleton`, which is `aria-hidden` and correctly so, and nothing
 * around it said anything at all. */
describe("LoadingRegion", () => {
  it("marks the block busy and announces the label while a read is in flight", () => {
    render(
      <LoadingRegion loading label="Loading leads" loadedLabel="Leads loaded">
        <Skeleton className="h-11 w-full" />
      </LoadingRegion>,
    )

    const status = screen.getByRole("status")
    expect(status.textContent).toBe("Loading leads")
    expect(status.closest("[aria-busy]")?.getAttribute("aria-busy")).toBe("true")
  })

  it("announces arrival and drops aria-busy once the content is there", () => {
    const { rerender } = render(
      <LoadingRegion loading label="Loading leads" loadedLabel="Leads loaded">
        <Skeleton />
      </LoadingRegion>,
    )

    rerender(
      <LoadingRegion loading={false} label="Loading leads" loadedLabel="Leads loaded">
        <table>
          <tbody>
            <tr>
              <td>Ada</td>
            </tr>
          </tbody>
        </table>
      </LoadingRegion>,
    )

    const status = screen.getByRole("status")
    expect(status.textContent).toBe("Leads loaded")
    expect(status.closest("div")?.hasAttribute("aria-busy")).toBe(false)
    expect(screen.getByText("Ada")).toBeTruthy()
  })

  it("says nothing at all when the content was in cache and never loaded", () => {
    render(
      <LoadingRegion loading={false} label="Loading leads" loadedLabel="Leads loaded">
        <p>Ada</p>
      </LoadingRegion>,
    )

    expect(screen.getByRole("status").textContent).toBe("")
  })

  /* traps.md §53 and §59, through `lib/query-state.ts`'s `readFailed`: an error
   * and a paused retry are both settled failures, and a region that keeps
   * claiming to be loading through one is the spinner that never resolves. */
  it("neither claims to be loading nor claims to have loaded when the read failed", () => {
    const { rerender } = render(
      <LoadingRegion loading label="Loading leads" loadedLabel="Leads loaded">
        <Skeleton />
      </LoadingRegion>,
    )
    expect(screen.getByRole("status").textContent).toBe("Loading leads")

    rerender(
      <LoadingRegion failed loading={false} label="Loading leads" loadedLabel="Leads loaded">
        <p role="alert">We couldn&apos;t load your leads.</p>
      </LoadingRegion>,
    )

    const status = screen.getByRole("status")
    expect(status.textContent).toBe("")
    expect(status.closest("div")?.hasAttribute("aria-busy")).toBe(false)
  })

  it("stays quiet while a read that is still in flight is already known to have failed", () => {
    render(
      <LoadingRegion failed loading label="Loading leads">
        <Skeleton />
      </LoadingRegion>,
    )

    const status = screen.getByRole("status")
    expect(status.textContent).toBe("")
    expect(status.closest("div")?.hasAttribute("aria-busy")).toBe(false)
  })

  /* Acceptance criterion 4. A region that re-announces four times because a
   * parent re-rendered is worse than silence, so the text node must change once
   * per transition and not once per render. */
  it("writes its text once per transition, not once per render", async () => {
    const { rerender } = render(
      <LoadingRegion loading label="Loading leads" loadedLabel="Leads loaded">
        <Skeleton />
      </LoadingRegion>,
    )

    const status = screen.getByRole("status")
    let mutations = 0
    const observer = new MutationObserver((records) => {
      mutations += records.length
    })
    observer.observe(status, { characterData: true, childList: true, subtree: true })

    for (let i = 0; i < 4; i += 1) {
      rerender(
        <LoadingRegion loading label="Loading leads" loadedLabel="Leads loaded">
          <Skeleton />
        </LoadingRegion>,
      )
    }
    await Promise.resolve()

    expect(mutations).toBe(0)
    expect(status.textContent).toBe("Loading leads")
  })

  /* `/inbox` mounts three `InboxList`s, `/analytics` seven panels. Each of
   * those components owns a region so that it announces when it *is* the page;
   * the page above them owns one too, and only one of the two may speak. */
  it("defers to an ancestor region instead of announcing a second time", () => {
    render(
      <LoadingRegion loading label="Loading your inbox">
        <LoadingRegion loading label="Loading live conversations">
          <Skeleton />
        </LoadingRegion>
        <LoadingRegion loading label="Loading qualified leads">
          <Skeleton />
        </LoadingRegion>
      </LoadingRegion>,
    )

    expect(screen.getAllByRole("status")).toHaveLength(1)
    expect(screen.getByRole("status").textContent).toBe("Loading your inbox")
    expect(document.querySelectorAll("[aria-busy='true']")).toHaveLength(1)
  })

  it("keeps a nested region's layout classes so deferring costs no styling", () => {
    const { container } = render(
      <LoadingRegion loading label="Loading your inbox">
        <LoadingRegion className="space-y-3" loading label="Loading live conversations">
          <Skeleton />
        </LoadingRegion>
      </LoadingRegion>,
    )

    expect(container.querySelector(".space-y-3")).toBeTruthy()
  })

  /* The primitive it wraps must not change: an `aria-hidden` decoration is the
   * right answer for a shimmering box, and the silence around it was the bug. */
  it("leaves the skeleton inside it hidden from assistive technology", () => {
    const { container } = render(
      <LoadingRegion loading label="Loading leads">
        <Skeleton className="h-11 w-full" />
      </LoadingRegion>,
    )

    expect(container.querySelector("[aria-hidden='true']")).toBeTruthy()
  })
})
