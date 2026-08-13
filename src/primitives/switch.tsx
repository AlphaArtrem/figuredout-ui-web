import { forwardRef } from "react"
import type { InputHTMLAttributes } from "react"
import { cn } from "../lib/cn.js"

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { className, label, ...props },
  ref,
) {
  return (
    <label className={cn("inline-flex cursor-pointer items-center gap-3 text-sm text-fg", className)}>
      <span className="relative inline-flex">
        <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
        {/* The off state carries a ring so the control keeps its edge on all
         * four surfaces — as a bare sunken pill it vanished inside a sunken
         * container. */}
        <span className="h-6 w-11 rounded-full bg-surface-sunken shadow-[inset_0_0_0_1px_var(--color-edge-strong)] transition duration-normal ease-standard peer-checked:bg-primary peer-checked:shadow-[inset_0_0_0_1px_var(--color-primary)] peer-focus-visible:ring-4 peer-focus-visible:ring-focus-ring peer-disabled:cursor-not-allowed peer-disabled:opacity-50" />
        <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface-raised shadow-sm transition duration-normal ease-standard peer-checked:translate-x-5 peer-disabled:opacity-50 motion-reduce:transition-none" />
      </span>
      {label ? <span>{label}</span> : null}
    </label>
  )
})
