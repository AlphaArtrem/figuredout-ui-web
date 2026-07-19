import userEvent from "@testing-library/user-event"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useRef, useState } from "react"
import { Button } from "../primitives/button.js"
import { Dialog } from "./dialog.js"

function DialogHarness() {
  const [open, setOpen] = useState(false)
  const confirmRef = useRef<HTMLButtonElement | null>(null)

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Archive lead"
        description="Confirm before removing this lead from the queue."
        initialFocusRef={confirmRef}
        footer={<Button ref={confirmRef}>Confirm</Button>}
      >
        <Button>Secondary action</Button>
      </Dialog>
    </div>
  )
}

describe("Dialog", () => {
  it("traps focus and closes on Escape", async () => {
    const user = userEvent.setup()

    render(<DialogHarness />)

    await user.click(screen.getByRole("button", { name: "Open dialog" }))

    expect(screen.getByRole("dialog")).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Confirm" })).toHaveFocus()
    })

    fireEvent.keyDown(document, { key: "Tab" })
    expect(screen.getByRole("button", { name: "Close dialog" })).toHaveFocus()

    fireEvent.keyDown(document, { key: "Escape" })
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Open dialog" })).toHaveFocus()
    })
  })
})
