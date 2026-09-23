import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { BottomNav } from "./bottom-nav.js"

const ITEMS = [
  { id: "home", label: "Home", icon: <span /> },
  { id: "inbox", label: "Inbox", icon: <span />, badge: 3, badgeLabel: "3 unread" },
  { id: "people", label: "People", icon: <span />, badge: 140 },
  { id: "more", label: "More", icon: <span /> },
]

describe("BottomNav", () => {
  it("is a named navigation landmark with the active item marked current", () => {
    render(<BottomNav items={ITEMS} activeItemId="inbox" />)

    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Inbox/ })).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("button", { name: "Home" })).not.toHaveAttribute("aria-current")
  })

  it("puts the badge's meaning in the item's name and caps a big count", () => {
    render(<BottomNav items={ITEMS} />)

    expect(screen.getByRole("button", { name: "Inbox 3 unread" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "People 99+" })).toBeInTheDocument()
  })

  it("reports the chosen id for button items", async () => {
    const user = userEvent.setup()
    const onItemSelect = vi.fn()
    render(<BottomNav items={ITEMS} onItemSelect={onItemSelect} />)

    await user.click(screen.getByRole("button", { name: "More" }))

    expect(onItemSelect).toHaveBeenCalledWith("more")
  })

  it("renders links for items with an href, through renderLink when given", () => {
    render(
      <BottomNav
        activeItemId="home"
        items={[
          { id: "home", label: "Home", icon: <span />, href: "/home" },
          { id: "inbox", label: "Inbox", icon: <span />, href: "/inbox" },
        ]}
        renderLink={({ children, href, ...props }) => (
          <a href={href} data-router="yes" className={props.className} aria-current={props["aria-current"]}>
            {children}
          </a>
        )}
      />,
    )

    const home = screen.getByRole("link", { name: "Home" })
    expect(home).toHaveAttribute("href", "/home")
    expect(home).toHaveAttribute("data-router", "yes")
    expect(home).toHaveAttribute("aria-current", "page")
  })

  it("keeps every target at least 44px tall", () => {
    render(<BottomNav items={ITEMS} />)

    for (const button of screen.getAllByRole("button")) {
      expect(button.className).toContain("min-h-[3.25rem]")
    }
  })
})
