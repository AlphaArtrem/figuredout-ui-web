import userEvent from "@testing-library/user-event"
import { render, screen } from "@testing-library/react"
import { Tabs } from "./tabs.js"

describe("Tabs", () => {
  it("supports arrow key navigation", async () => {
    const user = userEvent.setup()

    render(
      <Tabs
        defaultValue="overview"
        items={[
          { id: "overview", label: "Overview", content: <div>Overview panel</div> },
          { id: "notes", label: "Notes", content: <div>Notes panel</div> },
          { id: "activity", label: "Activity", content: <div>Activity panel</div> },
        ]}
      />,
    )

    const overview = screen.getByRole("tab", { name: /overview/i })
    overview.focus()
    await user.keyboard("{ArrowRight}")

    expect(screen.getByRole("tab", { name: /notes/i })).toHaveFocus()
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Notes panel")
  })
})
