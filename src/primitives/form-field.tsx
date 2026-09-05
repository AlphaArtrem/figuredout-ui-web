"use client"

import { createContext, useContext, useId, useMemo } from "react"
import type { AriaAttributes, HTMLAttributes, ReactNode } from "react"
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
 * field that holds a row of inputs as well as for a field that holds one.
 *
 * `invalid` rides the same channel for the same reason. `aria-invalid` has to
 * land on the control the user is focused on, and the field cannot reach into
 * its children to put it there — cloning would break the moment a field holds
 * more than one input, and it is `traps.md` §51's mistake in a new costume. So
 * the field states that it is in error and the controls mark themselves. */
interface FieldContextValue {
  describedBy?: string
  invalid?: boolean
  labelId?: string
}

const FieldContext = createContext<FieldContextValue | null>(null)

interface OwnFieldAria {
  "aria-describedby"?: string | undefined
  "aria-invalid"?: AriaAttributes["aria-invalid"]
  "aria-label"?: string | undefined
  "aria-labelledby"?: string | undefined
}

/* Anything the consumer set wins: a control that already carries its own name,
 * description or validity keeps it, and only the gaps are filled from the
 * field. `ownInvalid` is the control's own `invalid` prop, which sits between
 * the two — more specific than the field, less than an explicit attribute. */
export function useFieldAria(own: OwnFieldAria, ownInvalid = false): OwnFieldAria {
  const field = useContext(FieldContext)
  const alreadyNamed = own["aria-label"] != null || own["aria-labelledby"] != null
  const describedBy = [own["aria-describedby"], field?.describedBy].filter(Boolean).join(" ")

  return {
    "aria-describedby": describedBy || undefined,
    "aria-invalid": own["aria-invalid"] ?? (ownInvalid || field?.invalid ? true : undefined),
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
      ...(error ? { invalid: true } : {}),
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
      {/* `role="alert"` rather than a permanently mounted `role="status"`
        * wrapper: the node only exists while there is something to say, and an
        * alert is announced on insertion, which is exactly when a validation
        * error appears. A status region would have to be mounted empty on every
        * one of the 86 fields in the product to be reliable, and a field error
        * is assertive by nature — the user has just been stopped. `Toast` is
        * the polite half of this pair. */}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}
