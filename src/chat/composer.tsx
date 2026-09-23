"use client"

import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState } from "react"
import type { KeyboardEvent, ReactNode, TextareaHTMLAttributes } from "react"
import { PaperPlaneTilt } from "../icons/index.js"
import { cn } from "../lib/cn.js"
import { IconButton } from "../primitives/button.js"

export interface ComposerQuickReply {
  /** A glyph before the label. Mark it `aria-hidden`. */
  icon?: ReactNode
  id: string
  label: ReactNode
}

export type ComposerSendKey = "enter" | "mod-enter"

export interface ComposerProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "defaultValue" | "onChange" | "children"> {
  /** Controls after the text, before send — an emoji picker, a template menu. */
  actions?: ReactNode
  /** The control before the text, usually an attach `IconButton`. */
  attachAction?: ReactNode
  /** Uncontrolled starting text. */
  defaultValue?: string
  /** The textarea's accessible name. `"Message"` by default; it is visually hidden. */
  label?: string
  /** A line under the field — where the message goes, who will see it. */
  note?: ReactNode
  /** A glyph before `note`. Mark it `aria-hidden`. */
  noteIcon?: ReactNode
  /** A control at the end of the note line — a link, a ghost button. */
  noteAction?: ReactNode
  onQuickReply?: (reply: ComposerQuickReply) => void
  /**
   * Called with the text when the user sends. Uncontrolled, the field clears
   * itself afterwards; controlled, clearing is the caller's (so a failed send
   * can keep the text).
   */
  onSend: (value: string) => void
  onValueChange?: (value: string) => void
  /** Chips above the field that send or insert a canned reply. */
  quickReplies?: ComposerQuickReply[]
  /** Names the chip row. `"Suggested replies"` by default. */
  quickRepliesLabel?: string
  /** The send button's accessible name. `"Send"` by default. */
  sendLabel?: string
  /**
   * Which key sends. `enter` (the default): Enter sends and Shift+Enter breaks the
   * line. `mod-enter`: ⌘/Ctrl+Enter sends and Enter breaks the line — for long-form
   * replies, where an accidental send costs more than an extra key.
   */
  sendKey?: ComposerSendKey
  /** A send in flight: the send button is busy and pressing send again does nothing. Typing stays open. */
  sending?: boolean
  /** What the busy send button announces. `"Sending"` by default. */
  sendingLabel?: string
  value?: string
}

/* A layout effect so the field is the right height before it paints; the plain
 * effect on the server, where there is nothing to measure. */
const useMeasureEffect = typeof window === "undefined" ? useEffect : useLayoutEffect

/*
 * The message field. Grows with its text up to a cap (`max-h-40`, ten lines or
 * so) and scrolls inside itself past that, so a long draft never pushes the
 * conversation out of the pane.
 *
 * Visually it is a text FIELD, so it follows the field rules: a sunken hole with
 * an inset hairline, filled back up to `surface` with a primary hairline and the
 * standard 4px focus ring when the textarea has focus. The ring follows the
 * textarea only (`has-[textarea:focus]`), not `focus-within` — tabbing to the
 * attach button should ring the button, not the whole composer.
 *
 * Enter handling ignores IME composition: Enter is how a Japanese or Chinese
 * writer CONFIRMS a candidate, and sending on it posts half a word.
 */
export const Composer = forwardRef<HTMLTextAreaElement, ComposerProps>(function Composer(
  {
    actions,
    attachAction,
    className,
    defaultValue = "",
    disabled = false,
    id,
    label = "Message",
    note,
    noteAction,
    noteIcon,
    onKeyDown,
    onQuickReply,
    onSend,
    onValueChange,
    placeholder,
    quickReplies,
    quickRepliesLabel = "Suggested replies",
    sendKey = "enter",
    sendLabel = "Send",
    sending = false,
    sendingLabel = "Sending",
    value: controlledValue,
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const noteId = `${textareaId}-note`
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement)

  const [internalValue, setInternalValue] = useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue
  const canSend = !disabled && !sending && value.trim().length > 0

  const setValue = useCallback(
    (next: string) => {
      if (!isControlled) {
        setInternalValue(next)
      }
      onValueChange?.(next)
    },
    [isControlled, onValueChange],
  )

  /* Grow to fit. `height: auto` first, or the field can only ever grow: its
   * scrollHeight never reads smaller than the height it already has. The CSS
   * `max-h` caps it and `overflow-y-auto` takes over past the cap. */
  const resize = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) {
      return
    }
    textarea.style.height = "auto"
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [])

  useMeasureEffect(() => {
    resize()
  }, [resize, value])

  const send = () => {
    if (!canSend) {
      return
    }
    onSend(value)
    if (!isControlled) {
      setInternalValue("")
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || event.key !== "Enter" || event.nativeEvent.isComposing) {
      return
    }
    const mod = event.metaKey || event.ctrlKey
    const sends = sendKey === "enter" ? !event.shiftKey && !mod : mod
    if (!sends) {
      return
    }
    /* Always swallow the sending key, even when there is nothing to send —
     * otherwise Enter on an empty composer inserts a blank line. */
    event.preventDefault()
    send()
  }

  return (
    <div className={cn("grid gap-2", className)}>
      {quickReplies && quickReplies.length > 0 ? (
        <div
          role="group"
          aria-label={quickRepliesLabel}
          /* One row that scrolls sideways, not a wrap: a wrapped chip row grows
           * the footer and steals height from the conversation. */
          className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {quickReplies.map((reply) => (
            <button
              key={reply.id}
              type="button"
              disabled={disabled}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 sm:min-h-8 text-[0.8125rem] font-medium text-fg-muted ring-1 ring-inset ring-edge-strong",
                "transition duration-fast ease-standard hover:bg-primary-soft hover:text-fg",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring",
                "disabled:cursor-not-allowed disabled:opacity-55",
              )}
              onClick={() => onQuickReply?.(reply)}
            >
              {reply.icon ? <span className="flex shrink-0 text-primary">{reply.icon}</span> : null}
              {reply.label}
            </button>
          ))}
        </div>
      ) : null}

      <div
        className={cn(
          "flex items-end gap-1 rounded-xl bg-surface-sunken p-1 shadow-[inset_0_0_0_1px_var(--color-edge-strong)] transition duration-normal ease-standard sm:gap-1.5 sm:p-1.5",
          "has-[textarea:focus]:bg-surface has-[textarea:focus]:shadow-[inset_0_0_0_1px_var(--color-primary)] has-[textarea:focus]:ring-4 has-[textarea:focus]:ring-focus-ring",
          disabled && "opacity-70",
        )}
      >
        {attachAction ? <div className="flex shrink-0 items-center">{attachAction}</div> : null}
        <label htmlFor={textareaId} className="sr-only">
          {label}
        </label>
        <textarea
          ref={textareaRef}
          id={textareaId}
          rows={1}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          aria-describedby={note ? noteId : undefined}
          className={cn(
            /* `py-3` on a 20px line makes the resting field 44px — the same as
             * the buttons either side, so a one-line composer is one row. */
            "block max-h-40 min-h-11 min-w-0 flex-1 resize-none overflow-y-auto border-0 bg-transparent px-1.5 py-3 text-sm leading-5 text-fg placeholder:text-fg-subtle",
            "focus:outline-none disabled:cursor-not-allowed sm:min-h-9 sm:py-2",
          )}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          {...props}
        />
        {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
        <IconButton
          aria-label={sendLabel}
          icon={<PaperPlaneTilt size={16} weight="fill" aria-hidden="true" />}
          /* 44px on a phone, where it is a thumb target; 36px from `sm`. */
          className="shrink-0 sm:min-h-9 sm:w-9"
          loading={sending}
          loadingLabel={sendingLabel}
          disabled={!canSend}
          onClick={send}
        />
      </div>

      {note || noteAction ? (
        <div className="flex min-w-0 items-center gap-2 px-1 text-[0.8125rem] text-fg-subtle sm:text-xs">
          {noteIcon ? <span className="flex shrink-0">{noteIcon}</span> : null}
          <span id={noteId} className="min-w-0 flex-1">
            {note}
          </span>
          {noteAction ? <div className="shrink-0">{noteAction}</div> : null}
        </div>
      ) : null}
    </div>
  )
})
