import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createRef } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MessageList } from "./message-list.js"
import type { MessageListHandle } from "./message-list.js"

/*
 * jsdom does no layout, so every size reads 0 and nothing can scroll. These
 * tests install a fake one: every message is ROW px tall and stacked in order,
 * the log's content is as tall as its messages, and the log shows VIEWPORT px of
 * it. That is enough to exercise the three behaviours the component exists for
 * — follow the bottom, leave a reader who scrolled up alone, keep the place when
 * history is prepended — without pretending to test CSS.
 */
const ROW = 50
const VIEWPORT = 200

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(function (this: HTMLElement) {
    if (this.getAttribute("role") !== "log") return 0
    const list = this.querySelector(":scope > div > div:last-child")
    return (list?.children.length ?? 0) * ROW
  })
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this.getAttribute("role") === "log" ? VIEWPORT : 0
  })
  vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(function (this: HTMLElement) {
    const parent = this.parentElement
    if (!parent) return 0
    return Array.prototype.indexOf.call(parent.children, this) * ROW
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

function rows(ids: number[]) {
  return ids.map((id) => <p key={id}>Message {id}</p>)
}

function range(from: number, to: number) {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index)
}

/* Scrolls the log as a user would: set the position, then let it hear about it. */
function scrollTo(log: HTMLElement, top: number) {
  log.scrollTop = top
  fireEvent.scroll(log)
}

describe("MessageList", () => {
  it("is a named, polite log the keyboard can reach", () => {
    render(<MessageList aria-label="Conversation with Sam">{rows([1])}</MessageList>)

    const log = screen.getByRole("log", { name: "Conversation with Sam" })
    expect(log).toHaveAttribute("aria-live", "polite")
    expect(log).toHaveAttribute("tabindex", "0")
  })

  it("anchors a short thread to the bottom of the pane", () => {
    render(<MessageList>{rows([1, 2])}</MessageList>)

    /* The inner column fills the scroller and pushes its content to the end. */
    const column = screen.getByRole("log").firstElementChild
    expect(column?.className).toContain("min-h-full")
    expect(column?.className).toContain("justify-end")
  })

  it("opens at the newest message", () => {
    render(<MessageList>{rows(range(1, 10))}</MessageList>)

    expect(screen.getByRole("log").scrollTop).toBe(10 * ROW)
  })

  it("follows new messages while the reader is at the bottom", () => {
    const { rerender } = render(<MessageList>{rows(range(1, 10))}</MessageList>)
    const log = screen.getByRole("log")
    scrollTo(log, 10 * ROW - VIEWPORT)

    rerender(<MessageList>{rows(range(1, 11))}</MessageList>)

    expect(log.scrollTop).toBe(11 * ROW)
    expect(screen.queryByRole("button", { name: /jump to latest|new messages/i })).toBeNull()
  })

  it("leaves a reader who scrolled up where they are, and offers a way back", () => {
    const { rerender } = render(<MessageList>{rows(range(1, 10))}</MessageList>)
    const log = screen.getByRole("log")
    scrollTo(log, 100)

    expect(screen.getByRole("button", { name: "Jump to latest" })).toBeInTheDocument()

    rerender(<MessageList>{rows(range(1, 11))}</MessageList>)

    expect(log.scrollTop).toBe(100)
    expect(screen.getByRole("button", { name: "New messages" })).toBeInTheDocument()
  })

  it("jumps to the newest message and follows again from the button", async () => {
    const user = userEvent.setup()
    const { rerender } = render(<MessageList>{rows(range(1, 10))}</MessageList>)
    const log = screen.getByRole("log")
    scrollTo(log, 0)

    await user.click(screen.getByRole("button", { name: "Jump to latest" }))

    expect(log.scrollTop).toBe(10 * ROW)
    expect(log).toHaveFocus()
    expect(screen.queryByRole("button", { name: "Jump to latest" })).toBeNull()

    rerender(<MessageList>{rows(range(1, 12))}</MessageList>)
    expect(log.scrollTop).toBe(12 * ROW)
  })

  it("keeps the reader's place when earlier messages are prepended", () => {
    const { rerender } = render(<MessageList>{rows(range(11, 20))}</MessageList>)
    const log = screen.getByRole("log")
    scrollTo(log, 60)

    rerender(<MessageList>{rows(range(6, 20))}</MessageList>)

    /* Five rows went in above: the view moves down by exactly their height, so
     * the message that was under the reader's eyes is still there. */
    expect(log.scrollTop).toBe(60 + 5 * ROW)
    expect(screen.queryByRole("button", { name: "New messages" })).toBeNull()
  })

  it("asks for earlier messages once on reaching the top, and not while busy", () => {
    const onReachTop = vi.fn()
    const { rerender } = render(<MessageList onReachTop={onReachTop}>{rows(range(1, 10))}</MessageList>)
    const log = screen.getByRole("log")

    scrollTo(log, 40)
    scrollTo(log, 10)
    expect(onReachTop).toHaveBeenCalledTimes(1)

    scrollTo(log, 200)
    rerender(
      <MessageList onReachTop={onReachTop} busy>
        {rows(range(1, 10))}
      </MessageList>,
    )
    scrollTo(log, 0)
    expect(onReachTop).toHaveBeenCalledTimes(1)
    expect(log).toHaveAttribute("aria-busy", "true")
  })

  it("scrolls to the bottom on request, even from far up", () => {
    const ref = createRef<MessageListHandle>()
    render(<MessageList ref={ref}>{rows(range(1, 10))}</MessageList>)
    const log = screen.getByRole("log")
    scrollTo(log, 0)

    act(() => ref.current?.scrollToBottom())

    expect(log.scrollTop).toBe(10 * ROW)
    expect(ref.current?.element).toBe(log)
  })

  it("renders a load-earlier slot outside the messages", () => {
    render(
      <MessageList loadEarlier={<button type="button">Load earlier</button>}>{rows([1])}</MessageList>,
    )

    const button = screen.getByRole("button", { name: "Load earlier" })
    expect(button).toBeInTheDocument()
    /* Outside the messages, so it is never mistaken for the anchor message. */
    expect(button.closest(".gap-3")).toBeNull()
  })
})
