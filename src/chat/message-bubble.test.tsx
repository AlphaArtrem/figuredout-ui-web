import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { ChatHeader } from "./chat-header.js"
import { ChatPane } from "./chat-pane.js"
import { MessageBubble } from "./message-bubble.js"
import { DayDivider, SystemEvent } from "./system-event.js"
import { TypingIndicator } from "./typing-indicator.js"

describe("MessageBubble", () => {
  it("puts incoming on the start side and outgoing and assistant on the end side", () => {
    const { container } = render(
      <>
        <MessageBubble variant="incoming">Hi</MessageBubble>
        <MessageBubble variant="outgoing">Hello</MessageBubble>
        <MessageBubble variant="assistant">Welcome</MessageBubble>
      </>,
    )

    const [incoming, outgoing, assistant] = Array.from(container.children)
    expect(incoming?.className).toContain("items-start")
    expect(outgoing?.className).toContain("items-end")
    expect(assistant?.className).toContain("items-end")
  })

  it("tells assistant and person-written outgoing messages apart", () => {
    render(
      <>
        <MessageBubble variant="outgoing">Mine</MessageBubble>
        <MessageBubble variant="assistant">Its</MessageBubble>
      </>,
    )

    expect(screen.getByText("Mine").className).toContain("bg-primary-soft")
    expect(screen.getByText("Its").className).toContain("bg-chat-assistant")
  })

  it("reads its delivery status in words and shows a failure outright", () => {
    render(
      <>
        <MessageBubble variant="outgoing" time="18:52" status="read">
          Seen
        </MessageBubble>
        <MessageBubble variant="outgoing" time="18:53" status="failed">
          Lost
        </MessageBubble>
      </>,
    )

    expect(screen.getByText("Read")).toHaveClass("sr-only")
    expect(screen.getByText("Not delivered")).not.toHaveClass("sr-only")
  })

  it("puts time in a <time> when given a machine-readable date", () => {
    render(
      <MessageBubble time="18:52" dateTime="2026-09-23T18:52:00Z" label="You" meta="edited">
        Hi
      </MessageBubble>,
    )

    expect(screen.getByText("18:52").tagName).toBe("TIME")
    expect(screen.getByText("18:52")).toHaveAttribute("datetime", "2026-09-23T18:52:00Z")
    expect(screen.getByText("You")).toBeInTheDocument()
    expect(screen.getByText("edited")).toBeInTheDocument()
  })

  it("draws no meta line when there is nothing to put in it", () => {
    const { container } = render(<MessageBubble>Just text</MessageBubble>)

    expect(container.firstElementChild?.children).toHaveLength(1)
  })

  it("tightens the corners where a run of bubbles meets", () => {
    render(
      <>
        <MessageBubble variant="outgoing" groupPosition="first">
          One
        </MessageBubble>
        <MessageBubble variant="outgoing" groupPosition="last">
          Two
        </MessageBubble>
      </>,
    )

    expect(screen.getByText("One").className).not.toContain("rounded-tr-")
    expect(screen.getByText("Two").className).toContain("rounded-tr-")
  })
})

describe("SystemEvent, DayDivider, TypingIndicator", () => {
  it("renders a system event's words with its tone", () => {
    render(<SystemEvent tone="warning">Handed over</SystemEvent>)

    expect(screen.getByText("Handed over").closest("p")?.className).toContain("bg-warning-soft")
  })

  it("reads a day divider's label and hides its rules", () => {
    const { container } = render(<DayDivider dateTime="2026-09-23">Today</DayDivider>)

    expect(screen.getByText("Today").tagName).toBe("TIME")
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2)
  })

  it("gives the typing indicator words and stops its motion under reduced motion", () => {
    const { container } = render(<TypingIndicator label="Sam is typing" />)

    expect(screen.getByText("Sam is typing")).toHaveClass("sr-only")
    for (const dot of Array.from(container.querySelectorAll('[aria-hidden="true"]'))) {
      expect(dot.className).toContain("motion-safe:animate-typing-dot")
      expect(dot.className).not.toMatch(/(^|\s)animate-typing-dot/)
    }
  })
})

describe("ChatPane and ChatHeader", () => {
  it("lays out header, body and footer as a bounded column", () => {
    const { container } = render(
      <ChatPane aria-label="Conversation" header={<ChatHeader title="Sam" />} footer={<div>Composer</div>}>
        <div>Body</div>
      </ChatPane>,
    )

    const pane = screen.getByRole("region", { name: "Conversation" })
    expect(pane.className).toContain("min-h-0")
    expect(pane.className).toContain("h-full")
    expect(screen.getByText("Body").parentElement?.className).toContain("min-h-0 flex-1")
    expect(container).toHaveTextContent("Composer")
  })

  it("titles the conversation with a heading at the requested level", () => {
    render(<ChatHeader title="Sam Rivera" subtitle="Online" headingLevel={3} actions={<button type="button">More</button>} />)

    expect(screen.getByRole("heading", { level: 3, name: "Sam Rivera" })).toBeInTheDocument()
    expect(screen.getByText("Online")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "More" })).toBeInTheDocument()
  })
})
