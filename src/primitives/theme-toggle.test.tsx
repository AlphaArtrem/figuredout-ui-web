import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

/* next-themes reads `window.matchMedia`, which jsdom does not implement, and
 * the thing under test is the naming and the toggle rather than the
 * persistence — so the hook is stubbed with real state and `setTheme` is the
 * assertion surface. `theme` is what is stored; `resolvedTheme` is what is on
 * screen, which for a stored "system" is the device's setting. */
const themeState: { theme: string; resolvedTheme: string } = { theme: "system", resolvedTheme: "light" }
const setTheme = vi.fn((next: string) => {
  themeState.theme = next
  themeState.resolvedTheme = next
})

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: themeState.theme, resolvedTheme: themeState.resolvedTheme, setTheme }),
}))

const { ThemeToggle } = await import("./theme-toggle.js")

beforeEach(() => {
  themeState.theme = "system"
  themeState.resolvedTheme = "light"
  setTheme.mockClear()
})

describe("ThemeToggle", () => {
  /* The bug this replaced: from "system" on a light device the first press
   * chose "light", nothing changed on screen, and switching took two presses. */
  it("switches on the first press when the device decides the theme", async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole("button"))
    expect(setTheme).toHaveBeenCalledTimes(1)
    expect(setTheme).toHaveBeenLastCalledWith("dark")
  })

  it("follows a dark device the same way", async () => {
    themeState.resolvedTheme = "dark"
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole("button"))
    expect(setTheme).toHaveBeenLastCalledWith("light")
  })

  it("toggles light → dark → light and never back to system", async () => {
    const user = userEvent.setup()
    const { rerender } = render(<ThemeToggle />)

    await user.click(screen.getByRole("button"))
    rerender(<ThemeToggle />)
    await user.click(screen.getByRole("button"))

    expect(setTheme.mock.calls.map(([theme]) => theme)).toEqual(["dark", "light"])
  })

  /* Finding 91: the name used to be the state, twice ("System Theme: System"). */
  it("names what a press will do, and shows no theme name", () => {
    render(<ThemeToggle />)

    const button = screen.getByRole("button", { name: "Switch to dark theme" })
    expect(button.textContent).toBe("")
  })

  it("announces the new state through a live region, silent until pressed", async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    expect(screen.getByRole("status")).toHaveTextContent("")

    await user.click(screen.getByRole("button"))
    expect(screen.getByRole("status")).toHaveTextContent("Theme set to dark.")
  })

  it("keeps the live region out of the button's accessible name", () => {
    render(<ThemeToggle />)

    expect(screen.getByRole("button").contains(screen.getByRole("status"))).toBe(false)
  })
})
