import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  Avatar,
  Button,
  ConfirmDialog,
  DescriptionList,
  Dialog,
  FormField,
  InfoBanner,
  Input,
  SidePanel,
  Tooltip,
  useToast,
} from "../index"
import { UsersThree } from "../src/icons/index"
import { DemoLabel, Stage } from "./demo-data"

const meta = {
  title: "Feedback & overlays",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Everything that reports state or covers the page. All of it shares one elevation — `shadow-overlay` — so *floating* looks the same whatever is floating.",
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Banners: Story = {
  name: "InfoBanner",
  parameters: {
    docs: {
      description: {
        story:
          "Five tones; warning and danger announce with `role=\"alert\"`. Each gains a bar on its leading edge in its own hue, so a stack is scannable by tone without any of them shouting — and so the tone is not carried by colour alone.",
      },
    },
  },
  render: () => (
    <Stage>
      <div className="grid gap-3">
        <InfoBanner tone="info" title="Backfill in progress" description="Historical events from 2024 are still loading. Counts will move." actions={<Button size="sm" variant="ghost">Details</Button>} />
        <InfoBanner tone="warning" title="Salesforce is degraded" description="Last successful sync was 51 minutes ago." />
        <InfoBanner tone="danger" title="Stripe webhook signature failed" description="Events are queued. Rotate the signing secret to resume." actions={<Button size="sm" variant="danger">Rotate</Button>} />
        <InfoBanner tone="success" title="All destinations caught up" description="Nothing pending as of 09:14." />
        <InfoBanner title="Neutral" description="For messages with no status attached." />
      </div>
    </Stage>
  ),
}

export const Tooltips: Story = {
  name: "Tooltip",
  parameters: {
    docs: {
      description: {
        story:
          "Hover and focus, top or bottom. It keeps the inverted surface — `fg` on `bg` — deliberately: it is the one floating element that does *not* use the raised surface, because a tooltip is an annotation on the thing under it, not a layer of the app.",
      },
    },
  },
  render: () => (
    <Stage>
      <div className="flex flex-wrap items-center gap-6 py-8">
        <Tooltip content="Runs are queued per source, so two sources never block each other.">
          <Button variant="secondary">Hover me</Button>
        </Tooltip>
        <Tooltip side="bottom" content="Last successful sync 51 minutes ago.">
          <Button variant="ghost">Below</Button>
        </Tooltip>
      </div>
    </Stage>
  ),
}

export const Dialogs: Story = {
  name: "Dialog",
  parameters: {
    docs: {
      description: {
        story:
          "Focus trap, Escape, restore-focus-on-close, three sizes. The shell loses its 1px padding wrapper for the same three-surface anatomy as Card — header on raised, body on surface, footer on sunken — at overlay elevation. Its hairline is an overlay pseudo-element, because an inset ring would be painted over by the header's full-bleed surface.",
      },
    },
  },
  render: function DialogStory() {
    const [open, setOpen] = useState(false)
    return (
      <Stage>
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <Dialog
          open={open}
          onOpenChange={setOpen}
          title="Edit source"
          description="Changes apply to the next scheduled run."
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Save changes</Button>
            </>
          }
        >
          <div className="grid gap-4">
            <FormField label="Display name" labelFor="dialog-name">
              <Input id="dialog-name" defaultValue="Snowflake — prod-analytics" />
            </FormField>
            <FormField label="Retry window" labelFor="dialog-retry" hint="Runs are queued per source, so overlapping schedules never collide.">
              <Input id="dialog-retry" defaultValue="15 minutes" />
            </FormField>
          </div>
        </Dialog>
      </Stage>
    )
  },
}

export const Confirms: Story = {
  name: "ConfirmDialog",
  parameters: {
    docs: {
      description: {
        story:
          "Dialog with a fixed footer: ghost cancel, then the confirm in `primary` or `danger`. The destructive action stays on the right where the primary action always is, so muscle memory does not misfire.",
      },
    },
  },
  render: function ConfirmStory() {
    const [open, setOpen] = useState(false)
    return (
      <Stage>
        <Button variant="danger" onClick={() => setOpen(true)}>
          Delete source
        </Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          size="sm"
          title="Delete this source?"
          description="This cannot be undone."
          confirmLabel="Delete source"
          confirmTone="danger"
          onConfirm={() => undefined}
          body="Deleting Snowflake — prod-analytics removes its 42 tables from every model that reads them. Runs already in flight will finish."
        />
      </Stage>
    )
  },
}

export const Panels: Story = {
  name: "SidePanel",
  parameters: {
    docs: {
      description: {
        story:
          "The right-edge sheet, same focus handling, two sizes. It slides in 24px over `--motion-normal`, and its ring is on the leading edge only — the other three sides meet the viewport, and a ring around all four reads as a floating card that failed to reach the edge.",
      },
    },
  },
  render: function PanelStory() {
    const [open, setOpen] = useState(false)
    return (
      <Stage>
        <Button onClick={() => setOpen(true)}>Open side panel</Button>
        <SidePanel open={open} onOpenChange={setOpen} title="Run #4,201" description="Started 09:05, finished 09:07 · triggered by schedule">
          <div className="grid gap-4">
            <InfoBanner tone="success" title="Completed" description="184,220 rows across 42 tables." />
            <DescriptionList
              items={[
                { label: "Duration", value: <span className="font-mono tabular-nums">2m 14s</span> },
                { label: "Queued", value: <span className="font-mono tabular-nums">4s</span> },
                { label: "Rows", value: <span className="font-mono tabular-nums">184,220</span> },
                { label: "Bytes", value: <span className="font-mono tabular-nums">1.4 GB</span> },
              ]}
            />
          </div>
        </SidePanel>
      </Stage>
    )
  },
}

export const Toasts: Story = {
  name: "ToastProvider, useToast",
  parameters: {
    docs: {
      description: {
        story:
          "Bottom-right stack, four tones, optional action, auto-dismiss at 4s. The shell is one raised surface with the tone carried by the icon halo. With no description the icon and title centre on each other; with one they top-align, so the icon always sits on the title.\n\nWrap the app in `ToastProvider` once — this Storybook does it in `.storybook/preview`.",
      },
    },
  },
  render: function ToastStory() {
    const toast = useToast()
    return (
      <Stage>
        <DemoLabel>With a description</DemoLabel>
        <div className="flex flex-wrap gap-3">
          {(["success", "info", "warning", "danger"] as const).map((tone) => (
            <Button
              key={tone}
              size="sm"
              variant="secondary"
              onClick={() =>
                toast.pushToast({
                  tone,
                  title: { success: "Source connected", info: "Backfill started", warning: "Salesforce is degraded", danger: "Webhook signature failed" }[tone],
                  description: { success: "42 tables are now syncing hourly.", info: "Historical events from 2024 are loading.", warning: "Last successful sync 51 minutes ago.", danger: "Events are queued until the secret is rotated." }[tone],
                })
              }
            >
              {tone}
            </Button>
          ))}
        </div>
        <DemoLabel>Title only, and with an action</DemoLabel>
        <div className="flex flex-wrap gap-3">
          <Button size="sm" variant="secondary" onClick={() => toast.pushToast({ tone: "info", title: "Filters cleared" })}>
            Title only
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              toast.pushToast({
                tone: "success",
                title: "Source connected",
                description: "42 tables are now syncing hourly.",
                action: { label: "View source", onClick: () => undefined },
              })
            }
          >
            With action
          </Button>
        </div>
      </Stage>
    )
  },
}

export const Avatars: Story = {
  name: "Avatar",
  parameters: {
    docs: {
      description: {
        story:
          "Initials on `primary-soft`, three sizes, optional image and subtitle. It gains a faint ring so it keeps its edge on the raised surfaces it usually appears on — menus, table rows, top bars.",
      },
    },
  },
  render: () => (
    <Stage>
      <div className="flex flex-wrap items-center gap-8">
        <Avatar size="sm" name="Aditi Patel" subtitle="Data Platform" />
        <Avatar name="Jordan Mize" subtitle="Billing" />
        <Avatar size="lg" name="Revenue Ops" subtitle="7 members" />
        <span className="inline-grid size-14 place-items-center rounded-full bg-primary-soft text-primary ring-1 ring-inset ring-primary/20">
          <UsersThree size={22} />
        </span>
      </div>
    </Stage>
  ),
}
