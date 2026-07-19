import { Check } from "../icons/index.js"
import { cn } from "../lib/cn.js"

export interface StepperStep {
  description?: string
  id: string
  title: string
}

export interface StepperProps {
  currentStep: string
  steps: StepperStep[]
}

export function Stepper({ currentStep, steps }: StepperProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep)

  return (
    <ol className="grid gap-4 md:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
      {steps.map((step, index) => {
        const isComplete = currentIndex > index
        const isCurrent = currentIndex === index
        return (
          <li
            key={step.id}
            className={cn(
              "rounded-lg border px-4 py-4 transition duration-fast ease-standard",
              isCurrent
                ? "border-primary bg-primary-soft"
                : isComplete
                  ? "border-success bg-success-soft"
                  : "border-edge bg-surface-raised",
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                  isCurrent ? "bg-primary text-primary-fg" : isComplete ? "bg-success text-primary-fg" : "bg-surface text-fg-muted",
                )}
              >
                {isComplete ? <Check size={14} aria-hidden="true" /> : index + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-fg">{step.title}</p>
                {step.description ? <p className="mt-1 text-sm text-fg-muted">{step.description}</p> : null}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
