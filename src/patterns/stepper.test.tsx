import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Stepper } from "./stepper.js"

const steps = [
  { id: "profile", title: "Business profile", description: "Who you are." },
  { id: "intake", title: "Intake fields" },
  { id: "matching", title: "Matching rules" },
]

describe("Stepper, by default", () => {
  it("renders the full list, with the current step marked, and no compact line", () => {
    const { container } = render(<Stepper currentStep="intake" steps={steps} />)

    const lists = container.querySelectorAll("ol")
    expect(lists).toHaveLength(1)
    expect(lists[0]?.className.split(" ")).toContain("grid")
    expect(lists[0]?.className).not.toContain("hidden")
    expect(screen.getByText("Intake fields").closest("li")).toHaveAttribute("aria-current", "step")
    expect(screen.queryByText("Step 2 of 3")).toBeNull()
  })
})

describe("Stepper, compact", () => {
  it("says which step of how many, over a track filled to that point", () => {
    const { container } = render(<Stepper variant="compact" currentStep="intake" steps={steps} />)

    expect(screen.getByText("Step 2 of 3")).toBeTruthy()
    const fill = container.querySelector("[aria-hidden='true'] > div") as HTMLElement
    expect(fill.style.width).toMatch(/^66\.66/)
  })

  it("keeps the ordered list, with aria-current, for assistive technology", () => {
    const { container } = render(<Stepper variant="compact" currentStep="intake" steps={steps} />)

    const list = container.querySelector("ol")!
    expect(list.className).toBe("sr-only")
    expect(list.querySelectorAll("li")).toHaveLength(3)
    expect(screen.getByText("Intake fields")).toHaveAttribute("aria-current", "step")
    // Titles only: no descriptions, and no second visible statement of the step.
    expect(screen.queryByText("Who you are.")).toBeNull()
  })

  it("lets the caller word the position", () => {
    render(
      <Stepper
        variant="compact"
        currentStep="matching"
        steps={steps}
        formatPosition={(position, total) => `${position}/${total}`}
      />,
    )

    expect(screen.getByText("3/3")).toBeTruthy()
  })
})

describe("Stepper, compact below a breakpoint", () => {
  it("renders both forms and displays exactly one at any width", () => {
    const { container } = render(<Stepper compactBelow="lg" currentStep="intake" steps={steps} />)

    const compactLine = screen.getByText("Step 2 of 3").parentElement!
    expect(compactLine.className).toContain("lg:hidden")

    const full = [...container.querySelectorAll("ol")].find((list) => list.className !== "sr-only")!
    expect(full.className).toContain("hidden lg:grid")
    expect(full.className.split(" ")).not.toContain("grid")
  })
})
