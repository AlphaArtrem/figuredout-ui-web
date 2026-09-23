import { useRef, useState } from "react"
import type { ReactNode } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  Badge,
  Button,
  ChatHeader,
  ChatPane,
  Composer,
  DayDivider,
  IconButton,
  MessageBubble,
  MessageList,
  SystemEvent,
  TypingIndicator,
} from "../index"
import type { MessageBubbleVariant, MessageListHandle, MessageStatus } from "../index"
import { CaretLeft, DotsThree, Lightning, Paperclip, Pause, Smiley, Sparkle, WarningCircle } from "../src/icons/index"
import { DemoLabel, Stage } from "./demo-data"

const meta = {
  title: "Chat",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The parts of a conversation screen. `ChatPane` is the full-height frame; `MessageList` is the scroll region, anchored to the bottom, following the newest message only while the reader is; `MessageBubble`, `SystemEvent`, `DayDivider` and `TypingIndicator` are what goes in it; `Composer` is pinned under it. **The pane needs a parent with a bounded height** — a viewport-tall app region, a grid row — or the thread grows the page instead of scrolling.",
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

interface DemoMessage {
  id: number
  variant: MessageBubbleVariant
  text: string
  time: string
  status?: MessageStatus
  meta?: string
}

const OPENING: DemoMessage[] = [
  { id: 1, variant: "incoming", text: "Hi, is the two-bedroom on Harbour Road still available?", time: "18:52" },
  { id: 2, variant: "assistant", text: "It is. I can check what fits you in about a minute. Are you looking to buy or rent?", time: "18:52", meta: "5s", status: "read" },
  { id: 3, variant: "incoming", text: "Buy. Budget around 1.2M, two bedrooms.", time: "18:53" },
  { id: 4, variant: "assistant", text: "Got it. Which neighbourhoods are you considering?", time: "18:53", meta: "4s", status: "read" },
  { id: 5, variant: "incoming", text: "Waterfront or Downtown. Actually — can I speak to someone about booking for three families?", time: "18:58" },
]

const EARLIER: DemoMessage[] = [
  { id: -3, variant: "incoming", text: "Hello?", time: "Mon 10:02" },
  { id: -2, variant: "assistant", text: "Hi! How can I help today?", time: "Mon 10:02", status: "read" },
  { id: -1, variant: "incoming", text: "Just browsing for now, thanks.", time: "Mon 10:04" },
]

function Initials({ children, tone = "warning" }: { children: ReactNode; tone?: "warning" | "neutral" }) {
  return (
    <span
      aria-hidden="true"
      className={
        tone === "warning"
          ? "grid size-10 place-items-center rounded-full bg-warning-soft text-sm font-semibold text-warning"
          : "grid size-10 place-items-center rounded-full bg-surface-sunken text-sm font-semibold text-fg-muted ring-1 ring-inset ring-edge-strong"
      }
    >
      {children}
    </span>
  )
}

function renderMessage(message: DemoMessage) {
  return (
    <MessageBubble
      key={message.id}
      variant={message.variant}
      time={message.time}
      {...(message.status ? { status: message.status } : {})}
      {...(message.meta ? { meta: message.meta } : {})}
      {...(message.variant === "assistant"
        ? { label: "Assistant", labelIcon: <Sparkle size={12} weight="fill" aria-hidden="true" /> }
        : message.variant === "outgoing"
          ? { label: "You" }
          : {})}
    >
      {message.text}
    </MessageBubble>
  )
}

/** A viewport-sized box, standing in for the app region below a top bar. */
function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`h-[40rem] overflow-hidden rounded-xl bg-background ring-1 ring-inset ring-edge ${className ?? ""}`}>
      {children}
    </div>
  )
}

export const Thread: Story = {
  name: "ChatPane — a live thread",
  parameters: {
    docs: {
      description: {
        story:
          "Everything wired together inside a fixed-height frame. Send a message, or add an incoming one, while scrolled to the bottom: the list follows. Scroll up first and it leaves you there and offers **New messages** instead. **Load earlier** prepends history without moving the message you were reading. Enter sends; Shift+Enter breaks the line.",
      },
    },
  },
  render: function ThreadStory() {
    const [messages, setMessages] = useState<DemoMessage[]>(OPENING)
    const [loadedEarlier, setLoadedEarlier] = useState(false)
    const [typing, setTyping] = useState(false)
    const nextId = useRef(100)
    const listRef = useRef<MessageListHandle>(null)

    const add = (message: Omit<DemoMessage, "id">) => {
      nextId.current += 1
      setMessages((current) => [...current, { ...message, id: nextId.current }])
    }

    return (
      <Stage>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => add({ variant: "incoming", text: "One more thing — is there parking?", time: "19:01" })}>
            Add an incoming message
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setTyping((current) => !current)}>
            {typing ? "Stop typing" : "Show typing"}
          </Button>
        </div>
        <Frame>
          <ChatPane
            aria-label="Conversation with Priya Nair"
            header={
              <ChatHeader
                avatar={<Initials>PN</Initials>}
                title="Priya Nair"
                status={
                  <Badge tone="warning">
                    <Pause size={12} weight="fill" aria-hidden="true" />
                    Assistant paused
                  </Badge>
                }
                subtitle="First reply in 5s · waiting 6 min"
                actions={
                  <IconButton aria-label="More actions" variant="ghost" size="sm" icon={<DotsThree size={18} aria-hidden="true" />} />
                }
              />
            }
            footer={
              <Composer
                placeholder="Reply as yourself…"
                attachAction={<IconButton aria-label="Attach a file" variant="ghost" icon={<Paperclip size={18} aria-hidden="true" />} className="sm:min-h-9 sm:w-9" />}
                actions={<IconButton aria-label="Insert emoji" variant="ghost" icon={<Smiley size={18} aria-hidden="true" />} className="hidden sm:inline-flex sm:min-h-9 sm:w-9" />}
                quickReplies={[
                  { id: "share", label: "Share matching listings", icon: <Lightning size={13} weight="fill" aria-hidden="true" /> },
                  { id: "visit", label: "Book a visit", icon: <Lightning size={13} weight="fill" aria-hidden="true" /> },
                  { id: "timeline", label: "Ask for a move-in date", icon: <Lightning size={13} weight="fill" aria-hidden="true" /> },
                ]}
                onQuickReply={(reply) => {
                  add({ variant: "outgoing", text: String(reply.label), time: "19:02", status: "sent" })
                  listRef.current?.scrollToBottom()
                }}
                note="Replies go out from your own number."
                noteAction={
                  <Button size="sm" variant="ghost" leadingIcon={<Sparkle size={14} aria-hidden="true" />}>
                    Hand back
                  </Button>
                }
                onSend={(text) => {
                  add({ variant: "outgoing", text, time: "19:02", status: "sent" })
                  listRef.current?.scrollToBottom()
                }}
              />
            }
          >
            <MessageList
              ref={listRef}
              aria-label="Messages with Priya Nair"
              loadEarlier={
                loadedEarlier ? null : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setLoadedEarlier(true)}
                  >
                    Load earlier messages
                  </Button>
                )
              }
            >
              {loadedEarlier ? <DayDivider>Monday</DayDivider> : null}
              {loadedEarlier ? EARLIER.map(renderMessage) : null}
              <DayDivider>Today · 18:52</DayDivider>
              {messages.map(renderMessage)}
              <SystemEvent tone="warning" icon={<Pause size={13} weight="fill" aria-hidden="true" />}>
                Asked for a person · assistant paused · you’ve been notified
              </SystemEvent>
              {typing ? <TypingIndicator variant="incoming" label="Priya is typing" /> : null}
            </MessageList>
          </ChatPane>
        </Frame>
      </Stage>
    )
  },
}

export const ShortThread: Story = {
  name: "MessageList — a short thread sits at the bottom",
  parameters: {
    docs: {
      description: {
        story:
          "Two messages in a tall pane start at the bottom, beside the composer, not at the top of an empty page. The inner column is `min-h-full` with `justify-end`; the scroller itself is a plain block, so a long thread still scrolls from its first message.",
      },
    },
  },
  render: () => (
    <Stage>
      <Frame className="h-[26rem]">
        <ChatPane
          aria-label="Practice conversation"
          header={<ChatHeader avatar={<Initials tone="neutral">YOU</Initials>} title="You, as a customer" subtitle="Practice chat · not counted" />}
          footer={<Composer placeholder="Type as the customer…" onSend={() => undefined} note="Nothing leaves this page." />}
        >
          <MessageList aria-label="Practice messages">
            <MessageBubble time="19:02">Hi, saw your listing. Still available?</MessageBubble>
            <MessageBubble variant="assistant" label="Assistant" labelIcon={<Sparkle size={12} weight="fill" aria-hidden="true" />} time="19:02" meta="1.4s">
              It is. Are you looking to buy or rent?
            </MessageBubble>
            <TypingIndicator variant="assistant" label="Assistant is replying" />
          </MessageList>
        </ChatPane>
      </Frame>
    </Stage>
  ),
}

export const Bubbles: Story = {
  name: "MessageBubble, SystemEvent, DayDivider",
  parameters: {
    docs: {
      description: {
        story:
          "Three voices. **Incoming** is the other party, on the lifted surface with a hairline. **Outgoing** is a person on this side, on the primary wash. **Assistant** is outgoing text the product wrote: same side, a deeper solid wash of the same hue (`--color-chat-assistant`), so where a person took over is visible at a glance. The tail corner points at the speaker; `groupPosition` tightens the corners where a run of bubbles meets. Status ticks carry their words for screen readers, and a failure prints them.",
      },
    },
  },
  render: () => (
    <Stage>
      <div className="grid gap-3 rounded-xl bg-background p-4 ring-1 ring-inset ring-edge">
        <DayDivider dateTime="2026-09-23">Today</DayDivider>
        <MessageBubble time="18:52" groupPosition="first">
          Hi!
        </MessageBubble>
        <MessageBubble time="18:52" groupPosition="last">
          Is the flat on Harbour Road still available? We’d want to move in before the end of next month if the numbers work.
        </MessageBubble>
        <MessageBubble variant="assistant" label="Assistant" labelIcon={<Sparkle size={12} weight="fill" aria-hidden="true" />} time="18:52" meta="5s" status="read">
          It is. Are you looking to buy or rent?
        </MessageBubble>
        <MessageBubble variant="outgoing" label="You" time="18:54" status="delivered" groupPosition="first">
          I’ll take it from here.
        </MessageBubble>
        <MessageBubble variant="outgoing" time="18:54" status="sending" groupPosition="middle">
          Give me a second to pull up the details.
        </MessageBubble>
        <MessageBubble variant="outgoing" time="18:55" status="failed" groupPosition="last">
          https://example.com/a-very-long-link-that-should-wrap-rather-than-push-the-bubble-wider-than-its-column
        </MessageBubble>
        <SystemEvent icon={<Pause size={13} weight="fill" aria-hidden="true" />} tone="warning">
          Asked for a person · assistant paused
        </SystemEvent>
        <SystemEvent tone="danger" icon={<WarningCircle size={13} weight="fill" aria-hidden="true" />}>
          Delivery failed for one message
        </SystemEvent>
        <SystemEvent>Conversation closed</SystemEvent>
        <TypingIndicator />
        <TypingIndicator variant="outgoing" />
      </div>
    </Stage>
  ),
}

export const ComposerStates: Story = {
  name: "Composer",
  parameters: {
    docs: {
      description: {
        story:
          "A text field, so a sunken hole that fills up to `surface` with the one focus ring when the textarea has focus — not when a button inside it does. It grows to about ten lines, then scrolls inside itself. Enter sends and Shift+Enter breaks the line; `sendKey=\"mod-enter\"` swaps them for long-form replies. `sending` makes the send button busy without locking the text.",
      },
    },
  },
  render: function ComposerStory() {
    const [sent, setSent] = useState<string[]>([])
    return (
      <Stage>
        <DemoLabel>Default — Enter sends</DemoLabel>
        <Composer placeholder="Write a message…" onSend={(text) => setSent((current) => [text, ...current].slice(0, 3))} />
        {sent.length ? <p className="m-0 text-sm text-fg-muted">Last sent: {sent[0]}</p> : null}
        <DemoLabel>mod-enter — ⌘/Ctrl+Enter sends</DemoLabel>
        <Composer placeholder="Long-form reply…" sendKey="mod-enter" onSend={() => undefined} note="⌘/Ctrl+Enter to send." />
        <DemoLabel>Sending</DemoLabel>
        <Composer defaultValue="On its way" sending onSend={() => undefined} />
        <DemoLabel>Disabled</DemoLabel>
        <Composer placeholder="This conversation is closed" disabled onSend={() => undefined} />
      </Stage>
    )
  },
}

export const MobileThread: Story = {
  name: "ChatPane — phone width",
  parameters: {
    docs: {
      description: {
        story:
          "The same parts at 390px: a back button in `leading`, 44px controls, bubbles up to 85% wide, and a footer that clears the home indicator with `env(safe-area-inset-bottom)`.",
      },
    },
  },
  render: () => (
    <Stage>
      <div className="mx-auto h-[44rem] w-full max-w-[24.375rem] overflow-hidden rounded-xl bg-background ring-1 ring-inset ring-edge">
        <ChatPane
          aria-label="Conversation with Priya Nair"
          header={
            <ChatHeader
              leading={<IconButton aria-label="Back to inbox" variant="ghost" icon={<CaretLeft size={18} aria-hidden="true" />} />}
              avatar={<Initials>PN</Initials>}
              title="Priya Nair"
              subtitle={
                <span className="inline-flex items-center gap-1 text-warning">
                  <Pause size={11} weight="fill" aria-hidden="true" />
                  Assistant paused
                </span>
              }
              actions={<IconButton aria-label="More actions" variant="ghost" icon={<DotsThree size={18} aria-hidden="true" />} />}
            />
          }
          footer={
            <Composer
              placeholder="Reply as yourself…"
              quickReplies={[
                { id: "share", label: "Share listings" },
                { id: "visit", label: "Book a visit" },
                { id: "back", label: "Hand back" },
              ]}
              onSend={() => undefined}
            />
          }
        >
          <MessageList aria-label="Messages with Priya Nair" contentClassName="sm:px-4 sm:py-4">
            <DayDivider>Today · 18:52</DayDivider>
            {OPENING.map(renderMessage)}
            <SystemEvent tone="warning" icon={<Pause size={13} weight="fill" aria-hidden="true" />}>
              Asked for a person · assistant paused
            </SystemEvent>
          </MessageList>
        </ChatPane>
      </div>
    </Stage>
  ),
}
