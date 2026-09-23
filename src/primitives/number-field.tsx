"use client"

import { useId, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import { Minus, Plus } from "../icons/index.js"
import { cn } from "../lib/cn.js"
import { Button } from "./button.js"
import { useFieldLabelId } from "./form-field.js"
import { Input } from "./input.js"

export interface NumberFieldProps {
  "aria-describedby"?: string
  /** Names the field when there is no `label` and no enclosing `FormField`. */
  "aria-label"?: string
  "aria-labelledby"?: string
  className?: string
  /** The verb in front of the field's name on the minus button. */
  decreaseLabel?: string
  disabled?: boolean
  id?: string
  /** The verb in front of the field's name on the plus button. */
  increaseLabel?: string
  invalid?: boolean
  /** The field's name, as words. Names the input and both buttons. */
  label?: string
  max?: number
  min?: number
  name?: string
  onValueChange: (next: number) => void
  required?: boolean
  step?: number
  value: number
}

const INTEGER = /^-?\d+$/

/* A bounded integer, edited by pressing as well as by typing.
 *
 * The input is a text field with `inputmode="numeric"` and the spin-button role,
 * not `type="number"`: a native number field changes its value under a scroll
 * wheel and accepts `e`, and neither is what a setting wants. The role and its
 * `aria-value*` attributes give a screen reader what the native one did, and
 * the arrow keys, Home and End step it the way the ARIA pattern expects.
 *
 * What it types is kept as a draft until it parses, so clearing the field to
 * type a new number does not snap the value to the lower bound under the caret.
 * A parsed value is clamped and sent at once; the draft is dropped on blur, so
 * the field then shows the value that was actually kept.
 *
 * NAMES. Inside a `FormField` the input inherits the field's name, required and
 * invalid state through `useFieldAria`, as `Input` always does. The buttons do
 * NOT inherit the name — that would announce both as "Max retries" (§80). They
 * point `aria-labelledby` at their own verb and at the field's label instead, so
 * they read "Decrease Max retries" without the field's words being copied into
 * a string. A `label` prop, when given, is used for all three directly.
 *
 * Both buttons are 44 × 44, and each is disabled at its own bound. A press that
 * reaches the bound moves focus to the input, because the button that was
 * pressed is about to become disabled and a disabled button drops focus to the
 * document. */
export function NumberField({
  "aria-describedby": ariaDescribedBy,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className,
  decreaseLabel = "Decrease",
  disabled = false,
  id,
  increaseLabel = "Increase",
  invalid = false,
  label,
  max,
  min,
  name,
  onValueChange,
  required,
  step = 1,
  value,
}: NumberFieldProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const decreaseId = useId()
  const increaseId = useId()
  const fieldLabelId = useFieldLabelId()

  const clamp = (next: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, next))
  const atMin = min != null && value <= min
  const atMax = max != null && value >= max

  function commit(next: number) {
    const clamped = clamp(next)
    if (clamped !== value) onValueChange(clamped)
    return clamped
  }

  function press(direction: 1 | -1) {
    setDraft(null)
    const kept = commit(value + direction * step)
    if ((direction === 1 && max != null && kept >= max) || (direction === -1 && min != null && kept <= min)) {
      inputRef.current?.focus()
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const target =
      event.key === "ArrowUp"
        ? value + step
        : event.key === "ArrowDown"
          ? value - step
          : event.key === "Home" && min != null
            ? min
            : event.key === "End" && max != null
              ? max
              : null
    if (target == null) return
    event.preventDefault()
    setDraft(null)
    commit(target)
  }

  /* The words a button is named by, in priority order: an explicit name the
   * caller gave, then an `aria-labelledby` the caller gave, then the enclosing
   * field's label, then the bare verb. */
  const ownName = ariaLabel ?? label
  const labelledBy = ownName == null ? (ariaLabelledBy ?? fieldLabelId) : undefined
  const buttonName = (verb: string, verbId: string) =>
    ownName != null
      ? { "aria-label": `${verb} ${ownName}` }
      : labelledBy != null
        ? { "aria-labelledby": `${verbId} ${labelledBy}` }
        : { "aria-label": verb }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="secondary"
        size="md"
        iconOnly
        disabled={disabled || atMin}
        onClick={() => press(-1)}
        {...buttonName(decreaseLabel, decreaseId)}
      >
        {labelledBy != null ? (
          <span id={decreaseId} className="sr-only">
            {decreaseLabel}
          </span>
        ) : null}
        <Minus size={16} aria-hidden="true" />
      </Button>
      <Input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        role="spinbutton"
        autoComplete="off"
        className="w-16 text-center tabular-nums"
        aria-label={ariaLabelledBy ? undefined : ownName}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        disabled={disabled}
        invalid={invalid}
        required={required}
        value={draft ?? String(value)}
        onChange={(event) => {
          const text = event.target.value
          setDraft(text)
          if (INTEGER.test(text.trim())) commit(Number(text.trim()))
        }}
        onBlur={() => setDraft(null)}
        onKeyDown={onKeyDown}
      />
      <Button
        variant="secondary"
        size="md"
        iconOnly
        disabled={disabled || atMax}
        onClick={() => press(1)}
        {...buttonName(increaseLabel, increaseId)}
      >
        {labelledBy != null ? (
          <span id={increaseId} className="sr-only">
            {increaseLabel}
          </span>
        ) : null}
        <Plus size={16} aria-hidden="true" />
      </Button>
    </div>
  )
}
