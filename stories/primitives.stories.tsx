import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  FormField,
  IconButton,
  Input,
  Select,
  Skeleton,
  Spinner,
  Switch,
  Textarea,
  ThemeToggle,
} from "../index"
import { CaretRight, Clock, DotsThree, Moon, Plus, Sun, Table, Trash, WarningCircle } from "../src/icons/index"
import { DemoLabel, Stage } from "./demo-data"

const meta = {
  title: "Primitives",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The single-purpose controls everything else is built from. Each story notes what changed from the previous system and why, so a Storybook pass can confirm nothing drifted.",
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Buttons: Story = {
  name: "Button, IconButton",
  parameters: {
    docs: {
      description: {
        story:
          "Four variants, two sizes, and every one takes a leading or trailing icon. `secondary` rests on `surface-raised` with a ring so it reads as a control on any of the four surfaces — on plain `surface` it was a white rectangle on a white card. `danger` uses `text-danger-fg`, not `primary-fg`, which in dark mode is a near-black green on a light red.",
      },
    },
  },
  render: () => (
    <Stage>
      <DemoLabel>Variants — md</DemoLabel>
      <div className="flex flex-wrap items-center gap-3">
        <Button>Save changes</Button>
        <Button variant="secondary">Cancel</Button>
        <Button variant="ghost">Learn more</Button>
        <Button variant="danger">Delete</Button>
        <Button disabled>Disabled</Button>
      </div>
      <DemoLabel>Icon and label</DemoLabel>
      <div className="flex flex-wrap items-center gap-3">
        <Button leadingIcon={<Plus size={16} />}>New source</Button>
        <Button variant="secondary" leadingIcon={<Clock size={16} />}>
          Run now
        </Button>
        <Button variant="ghost" leadingIcon={<Table size={16} />}>
          View as table
        </Button>
        <Button variant="danger" leadingIcon={<Trash size={16} />}>
          Delete
        </Button>
        <Button variant="secondary" trailingIcon={<CaretRight size={16} />}>
          Continue
        </Button>
      </div>
      <DemoLabel>Small, loading, icon-only</DemoLabel>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" leadingIcon={<Plus size={14} />}>
          New source
        </Button>
        <Button size="sm" variant="secondary">
          Filters
        </Button>
        <Button loading>Syncing…</Button>
        <IconButton aria-label="Row actions" variant="secondary" icon={<DotsThree size={18} />} />
        <IconButton aria-label="Delete" size="sm" variant="ghost" icon={<Trash size={16} />} />
      </div>
    </Stage>
  ),
}

export const Badges: Story = {
  name: "Badge",
  parameters: {
    docs: {
      description: {
        story:
          "Six tones. The ring is the tone's own hue rather than neutral `edge` — a success badge should be one object, not a green fill inside a grey outline. `dot` turns a badge into a status.",
      },
    },
  },
  render: () => (
    <Stage>
      <div className="flex flex-wrap items-center gap-3">
        <Badge>Neutral</Badge>
        <Badge tone="primary">Primary</Badge>
        <Badge tone="success">Success</Badge>
        <Badge tone="warning">Warning</Badge>
        <Badge tone="danger">Danger</Badge>
        <Badge tone="info">Info</Badge>
      </div>
      <DemoLabel>As a status</DemoLabel>
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone="success" dot>
          Live
        </Badge>
        <Badge tone="warning" dot>
          Degraded
        </Badge>
        <Badge tone="danger" dot>
          Failing
        </Badge>
        <Badge dot>Paused</Badge>
      </div>
    </Stage>
  ),
}

export const Cards: Story = {
  name: "Card",
  parameters: {
    docs: {
      description: {
        story:
          "Two surfaces, one object: header on `surface-raised`, body on `surface`, one hairline between, footer on `surface-sunken`. The package used to pad a shell by 1px and float a raised summary inside it — a card inside a card. Tone is a bar on the leading edge drawn as a left border, so it curves into the corners instead of being clipped by them.",
      },
    },
  },
  render: () => (
    <Stage>
      <div className="grid gap-4 md:grid-cols-2">
        <Card
          hoverable
          icon={<Table size={18} />}
          number="Source 04"
          title="Warehouse — Snowflake"
          description="Last landed 4 minutes ago"
          accessory={
            <Badge tone="success" dot>
              Healthy
            </Badge>
          }
        >
          <CardBody>Hourly incremental load, 42 tables, 1.2M rows since midnight.</CardBody>
          <CardFooter>
            <Button size="sm" variant="secondary">
              Configure
            </Button>
            <Button size="sm" variant="ghost">
              View log
            </Button>
          </CardFooter>
        </Card>

        <Card tone="danger" icon={<WarningCircle size={18} />} title="Stripe — webhook" description="Signature check failed 3× in the last hour">
          <CardBody>Events are queued and will replay automatically once the secret is rotated.</CardBody>
          <CardFooter>
            <Button size="sm" variant="danger">
              Rotate secret
            </Button>
          </CardFooter>
        </Card>
      </div>
      <DemoLabel>Tones, and header/body/footer used directly</DemoLabel>
      <div className="grid gap-4 md:grid-cols-2">
        <Card tone="info">
          <CardBody>tone=&quot;info&quot;</CardBody>
        </Card>
        <Card tone="warning">
          <CardBody>tone=&quot;warning&quot;</CardBody>
        </Card>
        <Card tone="success">
          <CardBody>tone=&quot;success&quot;</CardBody>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="m-0 text-sm font-semibold text-fg">CardHeader</h3>
          </CardHeader>
          <CardBody>CardBody grows, so CardFooter sits on the bottom edge when a grid stretches the card.</CardBody>
          <CardFooter>
            <span className="text-sm text-fg-muted">CardFooter</span>
          </CardFooter>
        </Card>
      </div>
    </Stage>
  ),
}

export const Fields: Story = {
  name: "Input, Textarea, Select",
  parameters: {
    docs: {
      description: {
        story:
          "A field sits on `surface-sunken`: a field is a hole you type into, and a white input on a white card had only its border to exist by. Focus fills it back to `surface` and adds the standard 4px ring. `Select` is the native control — its popup is drawn by the OS, so where the list must match the theme, use `SelectMenu`.",
      },
    },
  },
  render: () => (
    <Stage>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid content-start gap-4">
          <Input placeholder="Placeholder — md" />
          <Input fieldSize="sm" placeholder="Placeholder — sm" />
          <Input defaultValue="Focus me to see the ring" />
          <Input invalid defaultValue="not-an-email" />
          <Input disabled defaultValue="Disabled" />
        </div>
        <div className="grid content-start gap-4">
          <Select defaultValue="24h">
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </Select>
          <Textarea placeholder="Notes for the on-call engineer…" />
        </div>
      </div>
    </Stage>
  ),
}

export const FormFields: Story = {
  name: "FormField",
  parameters: {
    docs: {
      description: {
        story:
          "Label, control, hint, error. The label stays sentence-case semibold rather than a mono caption: a form label is an instruction, and the mono caption role is reserved for labels that name a value.",
      },
    },
  },
  render: () => (
    <Stage>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Warehouse name" labelFor="warehouse" required hint="Lowercase, no spaces. Used in the connection string.">
          <Input id="warehouse" defaultValue="prod-analytics" />
        </FormField>
        <FormField label="Retry window" labelFor="retry" error="Must be at least 1 minute.">
          <Input id="retry" invalid defaultValue="0" />
        </FormField>
      </div>
    </Stage>
  ),
}

export const Checkboxes: Story = {
  name: "Checkbox",
  parameters: {
    docs: {
      description: {
        story:
          "Drawn rather than a native box tinted with `accent-color`, so the checked state uses the same primary and the same focus ring as every other control — and so the indeterminate state renders at all.",
      },
    },
  },
  render: function CheckboxStory() {
    const [checked, setChecked] = useState(true)
    return (
      <Stage>
        <div className="grid gap-4">
          <label className="inline-flex items-center gap-3 text-sm text-fg">
            <Checkbox />
            Unchecked
          </label>
          <label className="inline-flex items-center gap-3 text-sm text-fg">
            <Checkbox checked={checked} onChange={(event) => setChecked(event.target.checked)} />
            Controlled
          </label>
          <label className="inline-flex items-center gap-3 text-sm text-fg">
            <Checkbox
              ref={(node) => {
                if (node) node.indeterminate = true
              }}
            />
            Indeterminate
          </label>
          <label className="inline-flex items-center gap-3 text-sm text-fg-subtle">
            <Checkbox checked disabled readOnly />
            Disabled
          </label>
        </div>
      </Stage>
    )
  },
}

export const Switches: Story = {
  name: "Switch",
  parameters: {
    docs: {
      description: {
        story:
          "Same size and travel as before. The off state gains a ring so it keeps its edge on all four surfaces — as a bare sunken pill it vanished inside a sunken container.",
      },
    },
  },
  render: () => (
    <Stage>
      <div className="grid gap-4">
        <Switch label="Pause ingestion" />
        <Switch label="Alert on failed sync" defaultChecked />
        <Switch label="Disabled" disabled />
      </div>
    </Stage>
  ),
}

export const Skeletons: Story = {
  name: "Skeleton",
  parameters: {
    docs: {
      description: {
        story:
          "A left-to-right sweep instead of an opacity pulse. A pulse reads as something asking for attention; a sweep reads as something still arriving. `prefers-reduced-motion` leaves a flat sunken block.",
      },
    },
  },
  render: () => (
    <Stage>
      <div className="grid max-w-md gap-4">
        <Skeleton className="h-5 w-2/5" />
        <Skeleton className="h-10" />
        <Skeleton className="h-3.5" />
        <Skeleton className="h-3.5 w-3/4" />
      </div>
    </Stage>
  ),
}

export const Spinners: Story = {
  name: "Spinner",
  parameters: {
    docs: {
      description: {
        story:
          "A ring rather than a spinning arrow glyph: at 16px the arrow's tail is a smear, and a ring reads as progress at any size. Keeps `role=\"status\"` and the visually-hidden label.",
      },
    },
  },
  render: () => (
    <Stage>
      <div className="flex flex-wrap items-center gap-6">
        <Spinner size={16} />
        <Spinner size={20} />
        <Spinner size={32} />
        <span className="inline-flex items-center gap-2 text-sm text-fg-muted">
          <Spinner size={16} label="Checking connection" />
          Checking connection…
        </span>
      </div>
    </Stage>
  ),
}

export const Theme: Story = {
  name: "ThemeToggle",
  parameters: {
    docs: {
      description: {
        story:
          "A ghost button cycling system → light → dark, with the current mode's icon and label. It reads `next-themes`, which the consuming app provides.",
      },
    },
  },
  render: () => (
    <Stage>
      <div className="flex flex-wrap items-center gap-3">
        <ThemeToggle />
        <span className="text-sm text-fg-muted">Every button can carry an icon and a label:</span>
        <Button size="sm" variant="ghost" leadingIcon={<Sun size={16} />}>
          Light
        </Button>
        <Button size="sm" variant="ghost" leadingIcon={<Moon size={16} />}>
          Dark
        </Button>
      </div>
    </Stage>
  ),
}
