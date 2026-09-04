"use client"

import { forwardRef } from "react"
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react"
import { CaretDown } from "../icons/index.js"
import { cn } from "../lib/cn.js"
import { useFieldAria } from "./form-field.js"

type FieldSize = "sm" | "md"

interface SharedFieldProps {
  fieldSize?: FieldSize
  invalid?: boolean
}

/* A field is a hole you type into, so it sits on surface-sunken. On the light
 * ladder a white input on a white card had nothing but its border to exist by;
 * focus fills it back up to `surface` and adds the standard 4px ring.
 *
 * `block` rather than the inline-block a form control is by default: inline
 * leaves a descender's worth of line box under the control, which makes a
 * wrapper taller than its field and drops any absolutely centred adornment —
 * the select caret, the search magnifier — a few pixels low. */
const FIELD_BASE =
  "block w-full rounded-md border-0 bg-surface-sunken px-3 text-sm text-fg shadow-[inset_0_0_0_1px_var(--color-edge)] transition duration-normal ease-standard placeholder:text-fg-subtle hover:shadow-[inset_0_0_0_1px_var(--color-edge-strong)] focus:bg-surface focus:outline-none focus:shadow-[inset_0_0_0_1px_var(--color-primary)] focus:ring-4 focus:ring-focus-ring disabled:cursor-not-allowed disabled:text-fg-subtle disabled:opacity-70"

const FIELD_SIZE: Record<FieldSize, string> = {
  sm: "min-h-9 py-2",
  md: "min-h-11 py-2.5",
}

const INVALID_STYLE =
  "shadow-[inset_0_0_0_1px_var(--color-danger)] hover:shadow-[inset_0_0_0_1px_var(--color-danger)] focus:shadow-[inset_0_0_0_1px_var(--color-danger)] focus:ring-danger-soft"

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, SharedFieldProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, fieldSize = "md", invalid = false, ...props },
  ref,
) {
  const fieldAria = useFieldAria(props)
  return (
    <input
      ref={ref}
      className={cn(FIELD_BASE, FIELD_SIZE[fieldSize], invalid && INVALID_STYLE, className)}
      aria-invalid={invalid || undefined}
      {...props}
      {...fieldAria}
    />
  )
})

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, SharedFieldProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid = false, rows = 4, ...props },
  ref,
) {
  const fieldAria = useFieldAria(props)
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(FIELD_BASE, "min-h-28 resize-y py-3", invalid && INVALID_STYLE, className)}
      aria-invalid={invalid || undefined}
      {...props}
      {...fieldAria}
    />
  )
})

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, SharedFieldProps {}

/* The native control. Its POPUP is drawn by the operating system: `color-scheme`
 * (inherited from the theme) and the option colours below are requests, not
 * instructions, and several platforms ignore both. Where the list has to match
 * the theme, use SelectMenu — that is the whole reason it exists.
 *
 * `self-start` on the wrapper stops a stretched grid row from making it taller
 * than the control and dropping the caret below it. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { children, className, fieldSize = "md", invalid = false, ...props },
  ref,
) {
  const fieldAria = useFieldAria(props)
  return (
    <div className="relative min-w-0 self-start">
      <select
        ref={ref}
        className={cn(
          FIELD_BASE,
          FIELD_SIZE[fieldSize],
          "cursor-pointer appearance-none pr-10 [&>option]:bg-surface-raised [&>option]:text-fg",
          invalid && INVALID_STYLE,
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
        {...fieldAria}
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
