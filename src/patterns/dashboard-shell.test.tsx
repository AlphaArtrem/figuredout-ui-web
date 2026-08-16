import userEvent from "@testing-library/user-event"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { DashboardShell } from "./dashboard-shell.js"

const navItems = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Orders" },
  { id: "disabled", label: "Disabled", disabled: true },
]

describe("DashboardShell", () => {
  it("renders navigation with active state and optional slots", () => {
    render(
      <DashboardShell
        title="Workspace"
        subtitle="Paper mode"
        activeItemId="orders"
        navItems={navItems}
        actions={<button type="button">Refresh</button>}
        status={<span>System online</span>}
        footer={<span>Signed in</span>}
      >
        <div>Dashboard content</div>
      </DashboardShell>,
    )

    expect(screen.getAllByText("Workspace").length).toBeGreaterThan(0)
    expect(screen.getByText("Dashboard content")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Orders" })).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("button", { name: "Refresh" })).toBeInTheDocument()
    expect(screen.getAllByText("System online").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Signed in").length).toBeGreaterThan(0)
  })

  it("names the app in the bar at every width, and keeps status with the sidebar title", () => {
    render(
      <DashboardShell
        title="Workspace"
        subtitle="Paper mode"
        navItems={navItems}
        status={<span>System online</span>}
      >
        <div>Dashboard content</div>
      </DashboardShell>,
    )

    const bar = screen.getByRole("banner")
    expect(within(bar).getByText("Workspace")).toBeInTheDocument()
    expect(within(bar).getByText("Paper mode")).toBeInTheDocument()
    expect(within(bar).queryByText("System online")).not.toBeInTheDocument()

    expect(within(screen.getByRole("complementary")).getByText("System online")).toBeInTheDocument()
  })

  it("calls selection callback for enabled navigation items only", async () => {
    const user = userEvent.setup()
    const onNavItemSelect = vi.fn()

    render(
      <DashboardShell
        title="Workspace"
        activeItemId="overview"
        navItems={navItems}
        onNavItemSelect={onNavItemSelect}
      >
        <div>Dashboard content</div>
      </DashboardShell>,
    )

    await user.click(screen.getByRole("button", { name: "Orders" }))
    await user.click(screen.getByRole("button", { name: "Disabled" }))

    expect(onNavItemSelect).toHaveBeenCalledTimes(1)
    expect(onNavItemSelect).toHaveBeenCalledWith("orders")
  })

  it("opens mobile navigation and closes it from overlay and Escape", async () => {
    const user = userEvent.setup()

    render(
      <DashboardShell title="Workspace" navItems={navItems}>
        <div>Dashboard content</div>
      </DashboardShell>,
    )

    await user.click(screen.getByRole("button", { name: "Open navigation" }))
    expect(screen.getByRole("button", { name: "Close navigation overlay" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Close navigation overlay" }))
    expect(screen.queryByRole("button", { name: "Close navigation overlay" })).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Open navigation" }))
    fireEvent.keyDown(document, { key: "Escape" })
    expect(screen.queryByRole("button", { name: "Close navigation overlay" })).not.toBeInTheDocument()
  })
})
