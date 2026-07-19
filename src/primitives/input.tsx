import { forwardRef } from "react"
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react"
import { CaretDown } from "../icons/index.js"
import { cn } from "../lib/cn.js"

type FieldSize = "sm" | "md"

interface SharedFieldProps {
  fieldSize?: FieldSize
  invalid?: boolean
}

const FIELD_BASE =
  "w-full rounded-md border border-edge bg-surface px-3 text-sm text-fg shadow-sm transition duration-normal ease-standard placeholder:text-fg-subtle focus:border-primary focus:outline-none focus:ring-4 focus:ring-focus-ring disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-fg-subtle"

const FIELD_SIZE: Record<FieldSize, string> = {
  sm: "min-h-9 py-2",
  md: "min-h-11 py-2.5",
}

const INVALID_STYLE = "border-danger focus:border-danger"

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, SharedFieldProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, fieldSize = "md", invalid = false, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(FIELD_BASE, FIELD_SIZE[fieldSize], invalid && INVALID_STYLE, className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  )
})

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, SharedFieldProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid = false, rows = 4, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(FIELD_BASE, "min-h-28 py-3", invalid && INVALID_STYLE, className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  )
})

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, SharedFieldProps {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { children, className, fieldSize = "md", invalid = false, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          FIELD_BASE,
          FIELD_SIZE[fieldSize],
          "appearance-none pr-10",
          invalid && INVALID_STYLE,
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
      >
        {children}
      </select>
      <CaretDown
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle"
      />
    </div>
  )
})
