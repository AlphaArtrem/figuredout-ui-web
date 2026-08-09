import userEvent from "@testing-library/user-event"
import { render, screen } from "@testing-library/react"
import { ExpandableTile } from "./expandable-tile.js"

describe("ExpandableTile", () => {
  it("toggles content and exposes expanded state", async () => {
    const user = userEvent.setup()

    render(
      <ExpandableTile title="Risk checks" description="Average buy and limits">
        Decision details
      </ExpandableTile>,
    )

    const trigger = screen.getByRole("button", { name: /risk checks/i })

    expect(trigger).toHaveAttribute("aria-expanded", "false")
    expect(screen.getByText("Decision details")).not.toBeVisible()

    await user.click(trigger)

    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText("Decision details")).toBeVisible()
  })
})
