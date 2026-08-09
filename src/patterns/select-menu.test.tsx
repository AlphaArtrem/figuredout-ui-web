import userEvent from "@testing-library/user-event"
import { render, screen } from "@testing-library/react"
import { SelectMenu } from "./select-menu.js"

const options = [
  { label: "All wallets", value: "" },
  { label: "Alpha wallet", value: "alpha" },
  { label: "Paused wallet", value: "paused", disabled: true },
]

describe("SelectMenu", () => {
  it("opens a themeable listbox and selects an option", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <SelectMenu
        label="Wallet"
        value=""
        onChange={onChange}
        options={options}
      />,
    )

    await user.click(screen.getByRole("button", { name: /wallet/i }))

    expect(screen.getByRole("listbox")).toBeInTheDocument()

    await user.click(screen.getByRole("option", { name: /alpha wallet/i }))

    expect(onChange).toHaveBeenCalledWith("alpha")
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  })

  it("supports arrow navigation and escape close", async () => {
    const user = userEvent.setup()

    render(
      <SelectMenu
        label="Wallet"
        value=""
        onChange={vi.fn()}
        options={options}
      />,
    )

    await user.click(screen.getByRole("button", { name: /wallet/i }))
    await user.keyboard("{ArrowDown}")

    expect(screen.getByRole("option", { name: /alpha wallet/i })).toHaveFocus()

    await user.keyboard("{Escape}")

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: /wallet/i })).toHaveFocus()
  })

  it("does not select disabled options", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <SelectMenu
        label="Wallet"
        value=""
        onChange={onChange}
        options={options}
      />,
    )

    await user.click(screen.getByRole("button", { name: /wallet/i }))
    await user.click(screen.getByRole("option", { name: /paused wallet/i }))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole("listbox")).toBeInTheDocument()
  })

  it("closes on outside click", async () => {
    const user = userEvent.setup()

    render(
      <div>
        <SelectMenu
          label="Wallet"
          value=""
          onChange={vi.fn()}
          options={options}
        />
        <button type="button">Outside</button>
      </div>,
    )

    await user.click(screen.getByRole("button", { name: /wallet/i }))
    expect(screen.getByRole("listbox")).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /outside/i }))

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
  })
})
