import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { CommandPalette, useCommandPaletteShortcut } from "./command-palette.js"
import type { CommandPaletteGroup, CommandPaletteProps } from "./command-palette.js"

function groups(onSelect = vi.fn()): CommandPaletteGroup[] {
  return [
    {
      id: "people",
      label: "People",
      items: [
        { id: "ritika", title: "Ritika Kaul", subtitle: "Score 94", onSelect: () => onSelect("ritika") },
        { id: "rahul", title: "Rahul Sethi", subtitle: "Score 38", keywords: ["sethi"], onSelect: () => onSelect("rahul") },
      ],
    },
    {
      id: "actions",
      label: "Actions",
      items: [
        { id: "add", title: "Add an item", shortcut: ["⌘", "L"], onSelect: () => onSelect("add") },
        { id: "locked", title: "Locked action", disabled: true, onSelect: () => onSelect("locked") },
        { id: "theme", title: "Switch theme", onSelect: () => onSelect("theme") },
      ],
    },
  ]
}

function Harness(props: Partial<CommandPaletteProps> & { onItem?: (id: string) => void }) {
  const [open, setOpen] = useState(true)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open palette
      </button>
      <CommandPalette open={open} onOpenChange={setOpen} groups={groups(props.onItem)} {...props} />
    </>
  )
}

/* The focus hook moves focus on the next animation frame. */
async function flushFrame() {
  await act(() => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined))))
}

describe("CommandPalette", () => {
  it("is a named modal dialog with focus in the search field", async () => {
    render(<Harness />)
    await flushFrame()

    expect(screen.getByRole("dialog", { name: "Command palette" })).toHaveAttribute("aria-modal", "true")
    expect(screen.getByRole("combobox", { name: "Search" })).toHaveFocus()
  })

  it("groups results under their labels and highlights the first", () => {
    render(<Harness />)

    expect(screen.getByRole("group", { name: "People" })).toBeInTheDocument()
    expect(screen.getByRole("group", { name: "Actions" })).toBeInTheDocument()
    const first = screen.getByRole("option", { name: /Ritika Kaul/ })
    expect(first).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-activedescendant", first.id)
  })

  it("moves with the arrows across groups, skipping disabled items and wrapping", async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await flushFrame()

    await user.keyboard("{ArrowDown}{ArrowDown}")
    expect(screen.getByRole("option", { name: /Add an item/ })).toHaveAttribute("aria-selected", "true")

    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("option", { name: /Switch theme/ })).toHaveAttribute("aria-selected", "true")

    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("option", { name: /Ritika Kaul/ })).toHaveAttribute("aria-selected", "true")

    await user.keyboard("{ArrowUp}")
    expect(screen.getByRole("option", { name: /Switch theme/ })).toHaveAttribute("aria-selected", "true")
  })

  it("chooses with Enter, runs the item and closes, returning focus", async () => {
    const user = userEvent.setup()
    const onItem = vi.fn()
    const onSelect = vi.fn()
    function Closed() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open palette
          </button>
          <CommandPalette open={open} onOpenChange={setOpen} groups={groups(onItem)} onSelect={onSelect} />
        </>
      )
    }
    render(<Closed />)
    await user.click(screen.getByRole("button", { name: "Open palette" }))
    await flushFrame()

    await user.keyboard("{ArrowDown}{Enter}")

    expect(onItem).toHaveBeenCalledWith("rahul")
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "rahul" }))
    expect(screen.queryByRole("dialog")).toBeNull()
    await flushFrame()
    expect(screen.getByRole("button", { name: "Open palette" })).toHaveFocus()
  })

  it("filters by title, subtitle and keywords as you type", async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await flushFrame()

    await user.keyboard("sethi")

    expect(screen.getAllByRole("option")).toHaveLength(1)
    expect(screen.getByRole("option", { name: /Rahul Sethi/ })).toHaveAttribute("aria-selected", "true")
    expect(screen.queryByRole("group", { name: "Actions" })).toBeNull()
    expect(screen.getByRole("status")).toHaveTextContent("1 result")
  })

  it("says so when nothing matches", async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await flushFrame()

    await user.keyboard("zzz")

    expect(screen.queryAllByRole("option")).toHaveLength(0)
    expect(screen.getAllByText("Nothing matches “zzz”.").length).toBeGreaterThan(0)
  })

  it("leaves filtering to the caller when filter is false", async () => {
    const user = userEvent.setup()
    render(<Harness filter={false} />)
    await flushFrame()

    await user.keyboard("zzz")

    expect(screen.getAllByRole("option").length).toBe(5)
  })

  it("closes on Escape", async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await flushFrame()

    await user.keyboard("{Escape}")

    expect(screen.queryByRole("dialog")).toBeNull()
  })

  it("chooses a row on click and ignores a disabled one", async () => {
    const user = userEvent.setup()
    const onItem = vi.fn()
    render(<Harness onItem={onItem} />)

    await user.click(screen.getByRole("option", { name: /Locked action/ }))
    expect(onItem).not.toHaveBeenCalled()

    await user.click(screen.getByRole("option", { name: /Switch theme/ }))
    expect(onItem).toHaveBeenCalledWith("theme")
  })
})

describe("useCommandPaletteShortcut", () => {
  function ShortcutHarness({ enabled = true }: { enabled?: boolean }) {
    const [count, setCount] = useState(0)
    useCommandPaletteShortcut(() => setCount((current) => current + 1), { enabled })
    return <output>{count}</output>
  }

  it("fires on ⌘K and on Ctrl+K, and not on a bare K", () => {
    render(<ShortcutHarness />)

    fireEvent.keyDown(window, { key: "k", metaKey: true })
    fireEvent.keyDown(window, { key: "K", ctrlKey: true })
    fireEvent.keyDown(window, { key: "k" })

    expect(screen.getByRole("status")).toHaveTextContent("2")
  })

  it("does nothing while disabled", () => {
    render(<ShortcutHarness enabled={false} />)

    fireEvent.keyDown(window, { key: "k", metaKey: true })

    expect(screen.getByRole("status")).toHaveTextContent("0")
  })
})
