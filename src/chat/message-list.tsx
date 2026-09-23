"use client"

import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react"
import type { HTMLAttributes, ReactNode, UIEvent } from "react"
import { ArrowDown } from "../icons/index.js"
import { cn } from "../lib/cn.js"

export interface MessageListHandle {
  /** The scrolling element. */
  element: HTMLDivElement | null
  /**
   * Scroll to the newest message and follow new ones again. Call it after the
   * user sends — their own message should always come into view, even when they
   * had scrolled up to read something first.
   */
  scrollToBottom: (options?: { smooth?: boolean }) => void
}

export interface MessageListProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Names the log. `"Messages"` by default; a thread-specific name is better. */
  "aria-label"?: string
  /**
   * True while older messages are being fetched and prepended. It sets
   * `aria-busy`, which holds the live region's announcements until it clears —
   * without it a screen reader reads out a page of history nobody asked for.
   */
  busy?: boolean
  children: ReactNode
  /** Classes for the inner column — padding, a max width for a wide pane. */
  contentClassName?: string
  /** The jump button's words while the reader is scrolled up. */
  jumpToLatestLabel?: string
  /** A slot above the first message: a "Load earlier" button, or a spinner while it loads. */
  loadEarlier?: ReactNode
  /** The jump button's words once something new has arrived below the reader. */
  newMessagesLabel?: string
  /** Called when the reader scrolls to within `threshold` of the top — wire it to a fetch of older messages. */
  onReachTop?: () => void
  /** Show a "jump to latest" button while the reader is scrolled away from the bottom. On by default. */
  showJumpToLatest?: boolean
  /** How close to the bottom, in px, counts as "at the bottom" — and so keeps following. `80` by default. */
  threshold?: number
}

/* Layout effects warn when a client component is rendered on the server, and
 * this one has nothing to measure there anyway. */
const useMeasureEffect = typeof window === "undefined" ? useEffect : useLayoutEffect

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
}

/*
 * A conversation's scroll region. Three behaviours, and they are the reason this
 * is a component rather than an `overflow-y-auto` div:
 *
 * 1. ANCHORED TO THE BOTTOM. A short thread sits at the bottom of the pane, next
 *    to the composer, the way every chat app draws it. The inner column is
 *    `min-h-full` with `justify-end` — and it has to be the INNER column. Put
 *    `justify-end` on the scroller itself and a long thread overflows off the top
 *    of a flex container, where no scrollbar can reach it.
 *
 * 2. FOLLOWS ONLY A READER WHO IS FOLLOWING. When something is added and the
 *    reader is within `threshold` of the bottom, the list scrolls to it. When they
 *    have scrolled up to read, it leaves them where they are and offers a
 *    "jump to latest" button instead — yanking someone mid-sentence is the worst
 *    thing a chat can do.
 *
 * 3. KEEPS ITS PLACE WHEN HISTORY IS PREPENDED. Loading earlier messages inserts
 *    content above the reader. The list remembers where its first message was and
 *    moves the scroll by however far that message moved, so the message the
 *    reader was looking at stays under their eyes. The browser's own scroll
 *    anchoring would do this where it exists, but not everywhere (and not in
 *    Safari for most of its life), and two mechanisms correcting the same jump
 *    double it — so `overflow-anchor` is off and this is the only one.
 *
 * It is a `role="log"`: a polite live region whose additions are announced, which
 * is what the ARIA spec names that role for. The scroller is focusable so a
 * keyboard reader can scroll it with the arrow keys.
 */
export const MessageList = forwardRef<MessageListHandle, MessageListProps>(function MessageList(
  {
    "aria-label": ariaLabel = "Messages",
    busy = false,
    children,
    className,
    contentClassName,
    jumpToLatestLabel = "Jump to latest",
    loadEarlier,
    newMessagesLabel = "New messages",
    onReachTop,
    onScroll,
    showJumpToLatest = true,
    threshold = 80,
    ...props
  },
  ref,
) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const messagesRef = useRef<HTMLDivElement | null>(null)
  /* Whether the reader is following the bottom. A ref, not state: it is read in
   * the layout effect of the very render that added content, before any scroll
   * event could have updated state. */
  const followingRef = useRef(true)
  const heightRef = useRef(0)
  const anchorRef = useRef<{ node: HTMLElement; top: number } | null>(null)
  /* `onReachTop` fires on entering the top zone, not on every scroll event
   * inside it — otherwise one flick fires a dozen fetches. */
  const inTopZoneRef = useRef(false)
  const [away, setAway] = useState(false)
  const [hasUnseen, setHasUnseen] = useState(false)

  const scrollToBottom = useCallback((options?: { smooth?: boolean }) => {
    const scroller = scrollerRef.current
    if (!scroller) {
      return
    }
    followingRef.current = true
    setAway(false)
    setHasUnseen(false)
    const top = scroller.scrollHeight
    if (options?.smooth && !prefersReducedMotion() && typeof scroller.scrollTo === "function") {
      scroller.scrollTo({ top, behavior: "smooth" })
    } else {
      scroller.scrollTop = top
    }
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      get element() {
        return scrollerRef.current
      },
      scrollToBottom,
    }),
    [scrollToBottom],
  )

  /* Runs after every render, because any render may have changed the content.
   * Reading `scrollHeight` is cheap next to the render that preceded it. */
  useMeasureEffect(() => {
    const scroller = scrollerRef.current
    const messages = messagesRef.current
    if (!scroller || !messages) {
      return
    }

    const height = scroller.scrollHeight
    const previousAnchor = anchorRef.current

    if (height !== heightRef.current) {
      if (followingRef.current) {
        scroller.scrollTop = height
      } else if (previousAnchor?.node.isConnected) {
        const moved = previousAnchor.node.offsetTop - previousAnchor.top
        if (moved !== 0) {
          /* Something went in above the first message the list knew about:
           * history was prepended. Move with it. */
          scroller.scrollTop += moved
        } else if (height > heightRef.current) {
          /* It grew and nothing above moved, so it grew below the reader. */
          setHasUnseen(true)
        }
      }
    }

    heightRef.current = scroller.scrollHeight
    const first = messages.firstElementChild
    anchorRef.current = first instanceof HTMLElement ? { node: first, top: first.offsetTop } : null
  })

  /* Content can also grow after the render that added it — an image finishing
   * loading, a font swapping in — and the pane itself can shrink when a phone's
   * keyboard opens. Neither re-renders React, so both are observed directly. */
  useEffect(() => {
    const scroller = scrollerRef.current
    const messages = messagesRef.current
    if (!scroller || !messages || typeof ResizeObserver === "undefined") {
      return
    }
    const observer = new ResizeObserver(() => {
      if (followingRef.current) {
        scroller.scrollTop = scroller.scrollHeight
      }
      heightRef.current = scroller.scrollHeight
    })
    observer.observe(messages)
    observer.observe(scroller)
    return () => observer.disconnect()
  }, [])

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    onScroll?.(event)
    const scroller = event.currentTarget
    const distanceFromBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight
    const atBottom = distanceFromBottom <= threshold
    followingRef.current = atBottom
    setAway(!atBottom)
    if (atBottom) {
      setHasUnseen(false)
    }
    const inTopZone = scroller.scrollTop <= threshold && scroller.scrollHeight > scroller.clientHeight
    if (inTopZone && !inTopZoneRef.current && !busy) {
      onReachTop?.()
    }
    inTopZoneRef.current = inTopZone
  }

  return (
    <div className={cn("relative flex min-h-0 flex-1 flex-col", className)}>
      <div
        ref={scrollerRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label={ariaLabel}
        aria-busy={busy || undefined}
        tabIndex={0}
        className={cn(
          /* `relative` makes this the offsetParent of every message, so the
           * anchor's `offsetTop` is measured in the scroller's own coordinates. */
          "relative min-h-0 flex-1 overflow-y-auto overscroll-contain [overflow-anchor:none]",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-focus-ring",
        )}
        onScroll={handleScroll}
        {...props}
      >
        <div className={cn("flex min-h-full flex-col justify-end px-4 py-4 sm:px-7 sm:py-6", contentClassName)}>
          {loadEarlier ? <div className="flex justify-center pb-3">{loadEarlier}</div> : null}
          <div ref={messagesRef} className="flex flex-col gap-3">
            {children}
          </div>
        </div>
      </div>
      {showJumpToLatest && away ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <button
            type="button"
            className={cn(
              "pointer-events-auto inline-flex min-h-9 items-center gap-2 rounded-full bg-surface-raised px-3.5 text-xs font-medium text-fg shadow-overlay ring-1 ring-inset ring-edge-strong",
              "transition duration-fast ease-standard hover:text-primary motion-safe:animate-rise",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring",
            )}
            onClick={() => {
              scrollToBottom({ smooth: true })
              /* The button unmounts under the pointer; hand focus to the list
               * rather than letting it fall to <body>. */
              scrollerRef.current?.focus({ preventScroll: true })
            }}
          >
            {hasUnseen ? <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" /> : null}
            <ArrowDown size={14} weight="bold" aria-hidden="true" />
            {hasUnseen ? newMessagesLabel : jumpToLatestLabel}
          </button>
        </div>
      ) : null}
    </div>
  )
})
