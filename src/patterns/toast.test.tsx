import userEvent from "@testing-library/user-event"
import { render, screen, waitFor } from "@testing-library/react"
import { Button } from "../primitives/button.js"
import { ToastProvider, useToast } from "./toast.js"

function ToastHarness() {
  const { pushToast } = useToast()
  return (
    <Button
      onClick={() =>
        pushToast({
          title: "Saved",
          description: "The routing policy is live.",
          duration: 50,
          tone: "success",
        })
      }
    >
      Notify
    </Button>
  )
}

describe("ToastProvider", () => {
  it("shows and dismisses toasts after their duration", async () => {
    const user = userEvent.setup()

    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    )

    await user.click(screen.getByRole("button", { name: "Notify" }))
    expect(screen.getByRole("status")).toHaveTextContent("Saved")

    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument()
    })
  })

  it("draws the action button at the 44px size unless asked for the compact one", async () => {
    const user = userEvent.setup()

    function ActionHarness() {
      const { pushToast } = useToast()
      return (
        <>
          <Button
            onClick={() =>
              pushToast({ title: "Default", duration: 60000, action: { label: "Undo", onClick: () => undefined } })
            }
          >
            Default
          </Button>
          <Button
            onClick={() =>
              pushToast({
                title: "Compact",
                duration: 60000,
                action: { label: "Redo", size: "sm", onClick: () => undefined },
              })
            }
          >
            Compact
          </Button>
        </>
      )
    }

    render(
      <ToastProvider>
        <ActionHarness />
      </ToastProvider>,
    )

    await user.click(screen.getByRole("button", { name: "Default" }))
    expect(screen.getByRole("button", { name: "Undo" })).toHaveClass("min-h-11")

    await user.click(screen.getByRole("button", { name: "Compact" }))
    expect(screen.getByRole("button", { name: "Redo" })).toHaveClass("min-h-9")
  })
})
