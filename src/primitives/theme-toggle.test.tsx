import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

/* next-themes reads `window.matchMedia`, which jsdom does not implement, and
 * the thing under test is the naming and not the persistence — so the hook is
 * stubbed with a real piece of state and `setTheme` is the assertion surface. */
const themeState = { theme: "system" as string | undefined }
const setTheme = vi.fn((next: string) => {
  themeState.theme = next
})

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: themeState.theme, setTheme }),
}))

const { ThemeToggle } = await import("./theme-toggle.js")

beforeEach(() => {
  themeState.theme = "system"
  setTheme.mockClear()
})

/* Finding 91: the control exposed its state through visible text AND an
 * `sr-only` span, so its accessible name computed to "System Theme: System" —
 * the state twice and the action never. It ships on every page through the top
 * bar. */
describe("ThemeToggle", () => {
  it("names what a press will do, not what the theme currently is", () => {
    render(<ThemeToggle />)

    const button = screen.getByRole("button", { name: "Switch to light theme" })
    expect(button).toBeTruthy()
    expect(screen.queryByRole("button", { name: /System Theme: System/ })).toBeNull()
  })

  it("names the next step at each point in the cycle", () => {
    themeState.theme = "light"
    const { unmount } = render(<ThemeToggle />)
    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toBeTruthy()
    unmount()

    themeState.theme = "dark"
    render(<ThemeToggle />)
    expect(screen.getByRole("button", { name: "Switch to system theme" })).toBeTruthy()
  })

  it("cycles system → light → dark → system", async () => {
    const user = userEvent.setup()

    const { rerender } = render(<ThemeToggle />)
    await user.click(screen.getByRole("button"))
    expect(setTheme).toHaveBeenLastCalledWith("light")

    rerender(<ThemeToggle />)
    await user.click(screen.getByRole("button"))
    expect(setTheme).toHaveBeenLastCalledWith("dark")

    rerender(<ThemeToggle />)
    await user.click(screen.getByRole("button"))
    expect(setTheme).toHaveBeenLastCalledWith("system")
  })

  /* The state is still available — it just is not part of the name. The live
   * region mounts empty so arriving at the page announces nothing. */
  it("announces the new state through a live region, silent until pressed", async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    expect(screen.getByRole("status")).toHaveTextContent("")

    await user.click(screen.getByRole("button"))
    expect(screen.getByRole("status")).toHaveTextContent("Theme set to light.")
  })

  it("keeps the live region out of the button's accessible name", () => {
    render(<ThemeToggle />)

    expect(screen.getByRole("button").contains(screen.getByRole("status"))).toBe(false)
  })
})
