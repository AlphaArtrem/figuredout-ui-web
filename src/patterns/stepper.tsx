import type { ReactNode } from "react"
import { Check } from "../icons/index.js"
import { cn } from "../lib/cn.js"
import { seamCorners } from "./seam-grid.js"

export interface StepperStep {
  description?: string
  id: string
  title: string
}

type StepperBreakpoint = "sm" | "md" | "lg"

export interface StepperProps {
  /**
   * Show the compact line below this breakpoint and the full list from it. For
   * a long sequence on a phone, where every step stacked one per row is a screen
   * of preamble before the step itself.
   */
  compactBelow?: StepperBreakpoint
  currentStep: string
  /** The compact line's words. "Step 3 of 10" by default. */
  formatPosition?: (position: number, total: number) => ReactNode
  steps: StepperStep[]
  /** `list` (the default) is every step; `compact` is the one line at every width. */
  variant?: "list" | "compact"
}

/* Literal class strings, so Tailwind can find them in the built output. */
const LIST_FROM: Record<StepperBreakpoint, string> = {
  sm: "hidden sm:grid",
  md: "hidden md:grid",
  lg: "hidden lg:grid",
}

const COMPACT_BELOW: Record<StepperBreakpoint, string> = {
  sm: "sm:hidden",
  md: "md:hidden",
  lg: "lg:hidden",
}

const defaultFormatPosition = (position: number, total: number) => `Step ${position} of ${total}`

/* A seam grid, because steps are a sequence: three gapped cards do not say
 * "then". Current step takes the primary wash, completed steps a success mark,
 * upcoming steps stay neutral.
 *
 * The compact form is "Step n of N" over a thin progress track. The track is
 * `aria-hidden` — the line above it says the same thing in words — and the
 * ordered list with `aria-current="step"` is still rendered, visually hidden, so
 * a screen reader keeps every step and which one it is on. With `compactBelow`
 * both forms are in the DOM and exactly one is displayed at any width, so the
 * accessibility tree never holds two lists. */
export function Stepper({
  compactBelow,
  currentStep,
  formatPosition = defaultFormatPosition,
  steps,
  variant = "list",
}: StepperProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep)

  const compact = (
    <div className={cn("space-y-2", variant === "list" && compactBelow ? COMPACT_BELOW[compactBelow] : null)}>
      <p className="m-0 font-mono text-xs text-fg-subtle">{formatPosition(currentIndex + 1, steps.length)}</p>
      <div aria-hidden="true" className="h-1 overflow-hidden rounded-full bg-surface-sunken">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${steps.length === 0 ? 0 : ((currentIndex + 1) / steps.length) * 100}%` }}
        />
      </div>
      <ol className="sr-only">
        {steps.map((step, index) => (
          <li key={step.id} aria-current={index === currentIndex ? "step" : undefined}>
            {step.title}
          </li>
        ))}
      </ol>
    </div>
  )

  if (variant === "compact") return compact

  // `lg`, not `md`: the corner helper rounds at base / sm / lg, so a grid that
  // changed column count at any other breakpoint would round its corners at the
  // wrong width.
  const list = (
    <ol
      className={cn(
        "m-0",
        compactBelow ? LIST_FROM[compactBelow] : "grid",
        "list-none gap-px rounded-xl bg-seam p-0 ring-1 ring-inset ring-edge lg:grid-cols-3",
      )}
    >
      {steps.map((step, index) => {
        const isComplete = currentIndex > index
        const isCurrent = currentIndex === index

        return (
          <li
            key={step.id}
            aria-current={isCurrent ? "step" : undefined}
            className={cn(
              "flex items-start gap-3 p-4 transition duration-fast ease-standard",
              isCurrent ? "bg-primary-soft" : "bg-surface",
              seamCorners(index, steps.length, { base: 1, lg: 3 }),
            )}
          >
            <span
              className={cn(
                "mt-0.5 inline-grid size-7 shrink-0 place-items-center rounded-full font-mono text-xs font-semibold",
                isCurrent
                  ? "bg-primary text-primary-fg"
                  : isComplete
                    ? "bg-success-soft text-success ring-1 ring-inset ring-success/40"
                    : "bg-surface-sunken text-fg-muted ring-1 ring-inset ring-edge-strong",
              )}
            >
              {isComplete ? <Check size={14} aria-hidden="true" /> : index + 1}
            </span>
            <div className="min-w-0">
              <p className="m-0 text-sm font-semibold text-fg">{step.title}</p>
              {step.description ? <p className="m-0 mt-1 text-sm text-fg-muted">{step.description}</p> : null}
            </div>
          </li>
        )
      })}
    </ol>
  )

  if (!compactBelow) return list

  return (
    <>
      {compact}
      {list}
    </>
  )
}
