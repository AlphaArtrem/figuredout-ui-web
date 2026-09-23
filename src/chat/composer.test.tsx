import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { Composer } from "./composer.js"

describe("Composer", () => {
  it("names the field and the send button", () => {
    render(<Composer onSend={() => undefined} label="Reply to Sam" />)

    expect(screen.getByRole("textbox", { name: "Reply to Sam" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument()
  })

  it("sends on Enter and clears itself when uncontrolled", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<Composer onSend={onSend} />)
    const field = screen.getByRole("textbox", { name: "Message" })

    await user.type(field, "Hello there{Enter}")

    expect(onSend).toHaveBeenCalledWith("Hello there")
    expect(field).toHaveValue("")
  })

  it("breaks the line on Shift+Enter instead of sending", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<Composer onSend={onSend} />)
    const field = screen.getByRole("textbox", { name: "Message" })

    await user.type(field, "First{Shift>}{Enter}{/Shift}Second")

    expect(onSend).not.toHaveBeenCalled()
    expect(field).toHaveValue("First\nSecond")
  })

  it("sends on ⌘/Ctrl+Enter only, in mod-enter mode", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<Composer onSend={onSend} sendKey="mod-enter" />)
    const field = screen.getByRole("textbox", { name: "Message" })

    await user.type(field, "One{Enter}Two")
    expect(onSend).not.toHaveBeenCalled()
    expect(field).toHaveValue("One\nTwo")

    await user.keyboard("{Control>}{Enter}{/Control}")
    expect(onSend).toHaveBeenCalledWith("One\nTwo")
  })

  it("does not send while an IME is composing", () => {
    const onSend = vi.fn()
    render(<Composer onSend={onSend} defaultValue="にほん" />)
    const field = screen.getByRole("textbox", { name: "Message" })

    fireEvent.keyDown(field, { key: "Enter", isComposing: true })

    expect(onSend).not.toHaveBeenCalled()
  })

  it("will not send blank text, and swallows the Enter that tried", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<Composer onSend={onSend} />)
    const field = screen.getByRole("textbox", { name: "Message" })

    await user.type(field, "   {Enter}")

    expect(onSend).not.toHaveBeenCalled()
    expect(field).toHaveValue("   ")
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled()
  })

  it("leaves clearing to the caller when controlled", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    function Controlled() {
      const [value, setValue] = useState("")
      return <Composer value={value} onValueChange={setValue} onSend={onSend} />
    }
    render(<Controlled />)
    const field = screen.getByRole("textbox", { name: "Message" })

    await user.type(field, "Keep me")
    await user.click(screen.getByRole("button", { name: "Send" }))

    expect(onSend).toHaveBeenCalledWith("Keep me")
    expect(field).toHaveValue("Keep me")
  })

  it("is busy while sending and will not send twice", async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<Composer onSend={onSend} sending defaultValue="Once" />)
    const field = screen.getByRole("textbox", { name: "Message" })

    await user.type(field, "{Enter}")

    expect(onSend).not.toHaveBeenCalled()
    const button = screen.getByRole("button", { name: /Send/ })
    expect(button).toHaveAttribute("aria-busy", "true")
    expect(screen.getByRole("status")).toHaveTextContent("Sending")
  })

  it("offers quick replies as a named group", async () => {
    const user = userEvent.setup()
    const onQuickReply = vi.fn()
    render(
      <Composer
        onSend={() => undefined}
        onQuickReply={onQuickReply}
        quickReplies={[
          { id: "hours", label: "Share opening hours" },
          { id: "visit", label: "Book a visit" },
        ]}
      />,
    )

    const group = screen.getByRole("group", { name: "Suggested replies" })
    expect(group).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Book a visit" }))

    expect(onQuickReply).toHaveBeenCalledWith(expect.objectContaining({ id: "visit" }))
  })

  it("describes the field with its note", () => {
    render(<Composer onSend={() => undefined} note="Replies go out from your own number." />)

    expect(screen.getByRole("textbox", { name: "Message" })).toHaveAccessibleDescription(
      "Replies go out from your own number.",
    )
  })
})
