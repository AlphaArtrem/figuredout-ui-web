import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { NotificationList } from "./notification-list.js"
import { Popover } from "./popover.js"

const ITEMS = [
  { id: "a", title: <><strong>Priya</strong> asked for a person</>, subtitle: "Paused at 5 of 7", time: "6m", unread: true, tone: "warning" as const, href: "/inbox/a" },
  { id: "b", title: "A token expires in 6 days", time: "2h", unread: true, tone: "warning" as const },
  { id: "c", title: "Dhruv accepted your invite", time: "1d", onSelect: vi.fn() },
]

describe("NotificationList", () => {
  it("titles itself, counts the unread and offers to mark them read", async () => {
    const user = userEvent.setup()
    const onMarkAllRead = vi.fn()
    render(<NotificationList items={ITEMS} onMarkAllRead={onMarkAllRead} />)

    const section = screen.getByRole("region", { name: "Notifications" })
    expect(within(section).getByRole("heading", { level: 2, name: "Notifications" })).toBeInTheDocument()
    expect(within(section).getByText("2 new")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Mark all read" }))
    expect(onMarkAllRead).toHaveBeenCalled()
  })

  it("hides mark-all-read when nothing is unread", () => {
    render(<NotificationList items={[{ id: "x", title: "Old news" }]} onMarkAllRead={() => undefined} />)

    expect(screen.queryByRole("button", { name: "Mark all read" })).toBeNull()
    expect(screen.queryByText(/new$/)).toBeNull()
  })

  it("makes linked rows links and actionable rows buttons, and says which are unread", () => {
    render(<NotificationList items={ITEMS} />)

    expect(screen.getByRole("link", { name: /Priya asked for a person.*Unread/ })).toHaveAttribute("href", "/inbox/a")
    expect(screen.getByRole("button", { name: /Dhruv accepted your invite/ })).toBeInTheDocument()
    expect(screen.getAllByText("Unread")).toHaveLength(2)
  })

  it("shows its empty state when there is nothing to list", () => {
    render(<NotificationList items={[]} />)

    expect(screen.getByText("You’re all caught up.")).toBeInTheDocument()
  })
})

describe("Popover", () => {
  function Bell() {
    return (
      <>
        <Popover
          label="Notifications"
          trigger={(props) => (
            <button type="button" {...props}>
              Bell
            </button>
          )}
        >
          <NotificationList items={ITEMS} onMarkAllRead={() => undefined} />
        </Popover>
        <button type="button">Elsewhere</button>
      </>
    )
  }

  it("opens a named, non-modal dialog from its trigger and lands focus in it", async () => {
    const user = userEvent.setup()
    render(<Bell />)
    const trigger = screen.getByRole("button", { name: "Bell" })
    expect(trigger).toHaveAttribute("aria-expanded", "false")
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog")

    await user.click(trigger)

    const dialog = screen.getByRole("dialog", { name: "Notifications" })
    expect(dialog).not.toHaveAttribute("aria-modal")
    expect(dialog).toHaveFocus()
    expect(trigger).toHaveAttribute("aria-expanded", "true")
    expect(trigger).toHaveAttribute("aria-controls", dialog.id)
  })

  it("closes on Escape and gives focus back to the trigger", async () => {
    const user = userEvent.setup()
    render(<Bell />)
    await user.click(screen.getByRole("button", { name: "Bell" }))

    await user.keyboard("{Escape}")

    expect(screen.queryByRole("dialog")).toBeNull()
    expect(screen.getByRole("button", { name: "Bell" })).toHaveFocus()
  })

  it("closes on a press outside it", async () => {
    const user = userEvent.setup()
    render(<Bell />)
    await user.click(screen.getByRole("button", { name: "Bell" }))

    await user.click(screen.getByRole("button", { name: "Elsewhere" }))

    expect(screen.queryByRole("dialog")).toBeNull()
  })
})
