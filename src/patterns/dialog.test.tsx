import userEvent from "@testing-library/user-event"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useRef, useState } from "react"
import { Button } from "../primitives/button.js"
import { vi } from "vitest"
import { ConfirmDialog, Dialog } from "./dialog.js"

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

/* Finding 67: `onConfirm(); onOpenChange(false)` ran in one handler, so the
 * dialog was gone before the request it started had finished — a failed delete
 * dismissed as though it had worked. */
function ConfirmHarness({ onConfirm }: { onConfirm: () => void | Promise<unknown> }) {
  const [open, setOpen] = useState(true)
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={setOpen}
      title="Delete editor"
      body="This will deactivate them."
      confirmLabel="Deactivate"
      confirmTone="danger"
      onConfirm={onConfirm}
    />
  )
}

describe("ConfirmDialog", () => {
  it("closes immediately when onConfirm returns nothing", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(<ConfirmHarness onConfirm={onConfirm} />)
    await user.click(screen.getByRole("button", { name: /Deactivate/ }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("stays open with a busy confirm button while a promise is pending", async () => {
    const user = userEvent.setup()
    let settle: () => void = () => {}
    const onConfirm = () => new Promise<void>((resolve) => { settle = resolve })

    render(<ConfirmHarness onConfirm={onConfirm} />)
    await user.click(screen.getByRole("button", { name: /Deactivate/ }))

    const confirm = screen.getByRole("button", { name: /Deactivate/ })
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(confirm).toHaveAttribute("aria-busy", "true")
    expect(confirm).toBeDisabled()
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled()

    settle()
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
  })

  it("refuses to be dismissed while the promise is pending", async () => {
    const user = userEvent.setup()
    let settle: () => void = () => {}
    const onConfirm = () => new Promise<void>((resolve) => { settle = resolve })

    render(<ConfirmHarness onConfirm={onConfirm} />)
    await user.click(screen.getByRole("button", { name: /Deactivate/ }))

    fireEvent.keyDown(document, { key: "Escape" })
    fireEvent.click(screen.getByRole("button", { name: "Close dialog overlay" }))
    expect(screen.getByRole("dialog")).toBeInTheDocument()

    settle()
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
  })

  it("closes when the promise resolves", async () => {
    const user = userEvent.setup()

    render(<ConfirmHarness onConfirm={() => Promise.resolve("done")} />)
    await user.click(screen.getByRole("button", { name: /Deactivate/ }))

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
  })

  it("stays open and announces the error when the promise rejects", async () => {
    const user = userEvent.setup()

    render(<ConfirmHarness onConfirm={() => Promise.reject(new Error("Request failed with status code 500"))} />)
    await user.click(screen.getByRole("button", { name: /Deactivate/ }))

    const alert = await screen.findByRole("alert")
    expect(alert).toHaveTextContent("Request failed with status code 500")
    expect(screen.getByRole("dialog")).toBeInTheDocument()

    const confirm = screen.getByRole("button", { name: /Deactivate/ })
    expect(confirm).toBeEnabled()
    expect(confirm).not.toHaveAttribute("aria-busy")
  })

  it("stays open and shows the error when onConfirm throws synchronously", async () => {
    const user = userEvent.setup()

    render(
      <ConfirmHarness
        onConfirm={() => {
          throw new Error("Nothing selected")
        }}
      />,
    )
    await user.click(screen.getByRole("button", { name: /Deactivate/ }))

    expect(await screen.findByRole("alert")).toHaveTextContent("Nothing selected")
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("can retry after a rejection, and closes on the attempt that works", async () => {
    const user = userEvent.setup()
    let attempt = 0
    const onConfirm = () => {
      attempt += 1
      return attempt === 1 ? Promise.reject(new Error("Boom")) : Promise.resolve()
    }

    render(<ConfirmHarness onConfirm={onConfirm} />)
    await user.click(screen.getByRole("button", { name: /Deactivate/ }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Boom")

    await user.click(screen.getByRole("button", { name: /Deactivate/ }))
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
    expect(attempt).toBe(2)
  })
})
