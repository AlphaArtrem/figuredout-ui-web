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
    <label className={cn("inline-flex items-center gap-3 text-sm text-fg", className)}>
      <span className="relative inline-flex">
        <input
          ref={ref}
          type="checkbox"
          className="peer sr-only"
          {...props}
        />
        <span className="h-6 w-11 rounded-full bg-surface-sunken transition duration-normal ease-standard peer-checked:bg-primary peer-focus-visible:ring-4 peer-focus-visible:ring-focus-ring peer-disabled:cursor-not-allowed peer-disabled:opacity-60" />
        <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface shadow-sm transition duration-normal ease-standard peer-checked:translate-x-5" />
      </span>
      {label ? <span>{label}</span> : null}
    </label>
  )
})
