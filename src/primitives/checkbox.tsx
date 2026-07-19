import { forwardRef } from "react"
import type { InputHTMLAttributes } from "react"
import { cn } from "../lib/cn.js"

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded-[0.3rem] border border-edge bg-surface text-primary transition duration-normal ease-standard",
        "focus:ring-4 focus:ring-focus-ring disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  )
})
