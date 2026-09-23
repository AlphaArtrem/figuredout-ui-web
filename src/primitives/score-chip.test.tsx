import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ScoreChip, scoreTone } from "./score-chip.js"

describe("ScoreChip", () => {
  it("takes its tone from the default thresholds", () => {
    expect(scoreTone(75)).toBe("success")
    expect(scoreTone(74)).toBe("warning")
    expect(scoreTone(60)).toBe("warning")
    expect(scoreTone(59)).toBe("danger")
  })

  it("renders the rounded score in the tone's wash", () => {
    render(<ScoreChip value={81.6} />)

    const chip = screen.getByText("82")
    expect(chip.className).toContain("bg-success-soft")
    expect(chip.className).toContain("text-success")
  })

  it("takes its own thresholds", () => {
    render(<ScoreChip value={50} thresholds={{ success: 50, warning: 30 }} />)

    expect(screen.getByText("50").className).toContain("bg-success-soft")
  })

  it("draws a missing score as a muted dash that says what it is", () => {
    const { container } = render(<ScoreChip value={null} />)

    const chip = container.firstElementChild!
    expect(chip.className).toContain("bg-surface-sunken")
    expect(chip.textContent).toBe("—No score")
    expect(screen.getByText("—").getAttribute("aria-hidden")).toBe("true")
  })

  it("treats NaN as missing, not as zero", () => {
    render(<ScoreChip value={Number.NaN} missingLabel="Not scored" />)

    expect(screen.getByText("Not scored")).toBeTruthy()
  })
})
