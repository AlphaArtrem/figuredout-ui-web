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
})
