"use client"

import { createContext, useContext, useId, useMemo } from "react"
import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "../lib/cn.js"

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  error?: string
  hint?: string
  label: ReactNode
  labelFor?: string
  required?: boolean
}

/* What a control inside a FormField inherits from it.
 *
 * `labelFor` is the native association and is always the better one — it also
 * makes the label a click target for the control. It is optional, though, and
 * a label with no `htmlFor` names nothing: the control is left with no
 * accessible name at all. So the field also publishes the id of its own label
 * and its hint/error text, and the field primitives below name themselves from
 * it. Referencing one label from several controls is legal, so this works for a
 * field that holds a row of inputs as well as for a field that holds one. */
interface FieldContextValue {
  describedBy?: string
  labelId?: string
}

const FieldContext = createContext<FieldContextValue | null>(null)

interface OwnFieldAria {
  "aria-describedby"?: string | undefined
  "aria-label"?: string | undefined
  "aria-labelledby"?: string | undefined
}

/* Anything the consumer set wins: a control that already carries its own name
 * or description keeps it, and only the gaps are filled from the field. */
export function useFieldAria(own: OwnFieldAria): OwnFieldAria {
  const field = useContext(FieldContext)
  const alreadyNamed = own["aria-label"] != null || own["aria-labelledby"] != null
  const describedBy = [own["aria-describedby"], field?.describedBy].filter(Boolean).join(" ")

  return {
    "aria-describedby": describedBy || undefined,
    "aria-labelledby": own["aria-labelledby"] ?? (alreadyNamed ? undefined : field?.labelId),
  }
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
  const fieldId = useId()
  const labelId = `${fieldId}-label`
  const hintId = `${fieldId}-hint`
  const errorId = `${fieldId}-error`

  const context = useMemo<FieldContextValue>(() => {
    const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ")
    return {
      ...(describedBy ? { describedBy } : {}),
      /* Only when `labelFor` has not already tied the label to its control —
       * otherwise the native association stands on its own. */
      ...(labelFor ? {} : { labelId }),
    }
  }, [error, errorId, hint, hintId, labelFor, labelId])

  return (
    <div className={cn("space-y-2", className)} {...props}>
      <label id={labelId} htmlFor={labelFor} className="block text-sm font-medium text-fg">
        {label}
        {required ? <span className="ml-1 text-danger">*</span> : null}
      </label>
      <FieldContext.Provider value={context}>{children}</FieldContext.Provider>
      {hint ? (
        <p id={hintId} className="text-sm text-fg-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}
