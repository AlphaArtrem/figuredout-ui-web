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
 * the field states that it is in error and the controls mark themselves.
 *
 * `required` rides it too, and it is the half of the asterisk fix that is easy
 * to miss. The asterisk is now `aria-hidden`, because it was being read as part
 * of every field's name ("App name star"). Hiding it alone would have been a
 * regression: a great many call sites mark the FIELD required and never pass
 * `required` to the control inside it, so the asterisk was the only signal
 * those fields had. The field therefore publishes its own `required` and the
 * controls set `aria-required` themselves — same mechanism, same reason. */
interface FieldContextValue {
  describedBy?: string
  invalid?: boolean
  labelId?: string
  required?: boolean
}

const FieldContext = createContext<FieldContextValue | null>(null)

interface OwnFieldAria {
  "aria-describedby"?: string | undefined
  "aria-invalid"?: AriaAttributes["aria-invalid"]
  "aria-label"?: string | undefined
  "aria-labelledby"?: string | undefined
  "aria-required"?: AriaAttributes["aria-required"]
}

/* Anything the consumer set wins: a control that already carries its own name,
 * description or validity keeps it, and only the gaps are filled from the
 * field. `ownInvalid` is the control's own `invalid` prop, which sits between
 * the two — more specific than the field, less than an explicit attribute.
 *
 * `aria-required` is stated whenever the FIELD is required, even on a control
 * that also carries the native `required` attribute. The two agree, so the
 * redundancy costs nothing, and making the flag depend on which of the two
 * spellings a call site happened to use would leave the answer to "is this
 * control required" different from field to field for no reason a reader could
 * see. A control that sets `aria-required` itself still wins. */
export function useFieldAria(own: OwnFieldAria, ownInvalid = false): OwnFieldAria {
  const field = useContext(FieldContext)
  const alreadyNamed = own["aria-label"] != null || own["aria-labelledby"] != null
  const describedBy = [own["aria-describedby"], field?.describedBy].filter(Boolean).join(" ")

  return {
    "aria-describedby": describedBy || undefined,
    "aria-invalid": own["aria-invalid"] ?? (ownInvalid || field?.invalid ? true : undefined),
    "aria-labelledby": own["aria-labelledby"] ?? (alreadyNamed ? undefined : field?.labelId),
    "aria-required": own["aria-required"] ?? (field?.required ? true : undefined),
  }
}

/* The checkable variant, for `Checkbox` and `Switch`.
 *
 * `aria-required`, `aria-invalid` and `aria-describedby` are inherited exactly
 * as `Input`, `Textarea` and `Select` inherit them: a call site that marks the
 * FIELD required almost never repeats it on the control, and since the asterisk
 * became `aria-hidden` these attributes are the only thing left saying so.
 *
 * The NAME is the careful half, and it is why this is a second hook rather than
 * one more caller of the first. A checkable control is nearly always named by
 * something local — a wrapping `<label>`, a sibling `<label htmlFor>`, its own
 * `aria-label`, `Switch`'s `label` prop — and `aria-labelledby` outranks every
 * one of those in name computation. Inheriting the field's name unconditionally
 * would rename a row of options after the group they sit in: "Hard filter —
 * entities that fail this are excluded" would announce as "Weighting". So the
 * caller states whether the control already has a name of its own, and the
 * field's label is taken only when it does not.
 *
 * The gap this leaves: a bare `<Checkbox />` inside a wrapping `<label>` inside
 * a `FormField` still inherits the field's name, because a component cannot see
 * its own ancestors at render time. Give that checkbox the `id` its label
 * should carry in `htmlFor`, or an `aria-label`. A whole group of them wants
 * `TagPicker` or a `fieldset`, not one field label repeated on every box. */
export function useCheckableFieldAria(own: OwnFieldAria, locallyNamed: boolean): OwnFieldAria {
  const inherited = useFieldAria(own)
  return locallyNamed ? { ...inherited, "aria-labelledby": own["aria-labelledby"] } : inherited
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
      ...(required ? { required: true } : {}),
      /* Only when `labelFor` has not already tied the label to its control —
       * otherwise the native association stands on its own. */
      ...(labelFor ? {} : { labelId }),
    }
  }, [error, errorId, hint, hintId, labelFor, labelId, required])

  return (
    <div className={cn("space-y-2", className)} {...props}>
      <label id={labelId} htmlFor={labelFor} className="block text-sm font-medium text-fg">
        {label}
        {/* The asterisk is decoration, not name. It sits inside the label, and
          * the label is what every control in the field is named from, so an
          * exposed asterisk made eighty-six controls announce as "App name
          * star". The required state is carried by `aria-required` on the
          * controls instead — see FieldContextValue above. */}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-danger">
            *
          </span>
        ) : null}
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
