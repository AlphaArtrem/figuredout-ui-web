import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "../lib/cn.js"

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  error?: string
  hint?: string
  label: ReactNode
  labelFor?: string
  required?: boolean
}

export function FormField({
  children,
  className,
  error,
  hint,
  label,
  labelFor,
  required = false,
  ...props
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      <label htmlFor={labelFor} className="block text-sm font-medium text-fg">
        {label}
        {required ? <span className="ml-1 text-danger">*</span> : null}
      </label>
      {children}
      {hint ? <p className="text-sm text-fg-muted">{hint}</p> : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  )
}
