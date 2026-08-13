import { forwardRef } from "react"
import type { InputHTMLAttributes } from "react"
import { Check, Minus } from "../icons/index.js"
import { cn } from "../lib/cn.js"

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {}

/* Drawn rather than a native box tinted with `accent-color`, so the checked
 * state uses the same --color-primary and the same 4px focus ring as every
 * other control — and so the indeterminate state renders at all.
 *
 * The input keeps the ref and every prop: it is still the checkbox, just
 * transparent, with the mark painted over it by a sibling. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, ...props },
  ref,
) {
  return (
    <span className={cn("relative inline-flex size-[1.15rem] shrink-0", className)}>
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          "peer size-full cursor-pointer appearance-none rounded-[0.35rem] bg-surface-sunken transition duration-fast ease-standard",
          "shadow-[inset_0_0_0_1px_var(--color-edge-strong)]",
          "checked:bg-primary checked:shadow-[inset_0_0_0_1px_var(--color-primary)]",
          "indeterminate:bg-primary indeterminate:shadow-[inset_0_0_0_1px_var(--color-primary)]",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
        {...props}
      />
      <Check
        size={12}
        weight="bold"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 m-auto text-primary-fg opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-0"
      />
      <Minus
        size={12}
        weight="bold"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 m-auto text-primary-fg opacity-0 peer-indeterminate:opacity-100"
      />
    </span>
  )
})
