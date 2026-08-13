import { Check } from "../icons/index.js"
import { cn } from "../lib/cn.js"
import { seamCorners } from "./seam-grid.js"

export interface StepperStep {
  description?: string
  id: string
  title: string
}

export interface StepperProps {
  currentStep: string
  steps: StepperStep[]
}

/* A seam grid, because steps are a sequence: three gapped cards do not say
 * "then". Current step takes the primary wash, completed steps a success mark,
 * upcoming steps stay neutral. */
export function Stepper({ currentStep, steps }: StepperProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep)

  // `lg`, not `md`: the corner helper rounds at base / sm / lg, so a grid that
  // changed column count at any other breakpoint would round its corners at the
  // wrong width.
  return (
    <ol className="m-0 grid list-none gap-px rounded-xl bg-seam p-0 ring-1 ring-inset ring-edge lg:grid-cols-3">
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
}
