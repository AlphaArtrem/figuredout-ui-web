import type { Meta, StoryObj } from "@storybook/react-vite"
import * as Icons from "../src/icons/index"
import { DemoLabel, Stage } from "./demo-data"

const meta = {
  title: "Foundations",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "What every component is built from. Change something here and the whole library moves — which is the point, and the reason components never hardcode a colour, a shadow or a duration.",
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const SURFACES = [
  ["bg", "The page itself", "bg-background"],
  ["surface-sunken", "Holes: inputs, tracks, wells", "bg-surface-sunken"],
  ["surface", "Cards, tables, panels", "bg-surface"],
  ["surface-raised", "Anything lifted", "bg-surface-raised"],
] as const

const TEXT = [
  ["fg", "Body", "bg-fg"],
  ["fg-muted", "Secondary", "bg-[var(--color-fg-muted)]"],
  ["fg-subtle", "Captions", "bg-[var(--color-fg-subtle)]"],
  ["edge", "Hairline", "bg-[var(--color-edge)]"],
  ["edge-strong", "Emphasis", "bg-[var(--color-edge-strong)]"],
] as const

const SEMANTIC = [
  ["primary", "bg-primary"],
  ["success", "bg-[var(--color-success)]"],
  ["warning", "bg-[var(--color-warning)]"],
  ["danger", "bg-[var(--color-danger)]"],
  ["info", "bg-[var(--color-info)]"],
  ["accent", "bg-accent"],
] as const

const CHART = [
  ["chart-cat-1", "bg-chart-cat-1"],
  ["chart-cat-2", "bg-chart-cat-2"],
  ["chart-cat-3", "bg-chart-cat-3"],
  ["chart-cat-4", "bg-chart-cat-4"],
  ["chart-cat-5", "bg-chart-cat-5"],
  ["chart-cat-6", "bg-chart-cat-6"],
] as const

function Swatch({ name, note, className }: { name: string; note?: string; className: string }) {
  return (
    <div className="overflow-hidden rounded-md bg-surface ring-1 ring-inset ring-edge">
      <div className={`h-12 ${className}`} />
      <div className="px-3 py-2 font-mono text-[0.6875rem]">
        <b className="block font-semibold text-fg">{name}</b>
        {note ? <span className="text-fg-muted">{note}</span> : null}
      </div>
    </div>
  )
}

export const Color: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The surface ladder is the load-bearing part: `sunken < bg < surface < raised`, in both themes. White is the top of it in light mode, not the resting surface — that is what leaves `surface-raised` free to mean *lifted*. Which surface a thing sits on is its meaning, not a preference.",
      },
    },
  },
  render: () => (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <DemoLabel>Surfaces — in ladder order</DemoLabel>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SURFACES.map(([name, note, className]) => (
            <Swatch key={name} name={name} note={note} className={className} />
          ))}
        </div>
      </div>
      <div className="grid gap-3">
        <DemoLabel>Text and edges</DemoLabel>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {TEXT.map(([name, note, className]) => (
            <Swatch key={name} name={name} note={note} className={className} />
          ))}
        </div>
      </div>
      <div className="grid gap-3">
        <DemoLabel>Semantic</DemoLabel>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SEMANTIC.map(([name, className]) => (
            <Swatch key={name} name={name} className={className} />
          ))}
        </div>
      </div>
      <div className="grid gap-3">
        <DemoLabel>Chart categorical</DemoLabel>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CHART.map(([name, className]) => (
            <Swatch key={name} name={name} className={className} />
          ))}
        </div>
      </div>
    </div>
  ),
}

export const Typography: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Two roles carry the system's voice: **captions** (mono, uppercase, 0.1em) name a value, and **figures** (mono, tabular) are a value. Everything else is the sans scale. `text-display` is the step above `text-4xl` — use it for the two or three regions a page is navigated by, not for every block on it.",
      },
    },
  },
  render: () => (
    <div className="grid divide-y divide-edge">
      {[
        ["text-display / 700", <span className="text-display font-bold tracking-[-0.03em]">Every number, traced</span>],
        ["text-3xl / 650", <span className="text-3xl font-[650] tracking-[-0.02em]">Page heading</span>],
        ["text-xl / 650", <span className="text-xl font-[650]">Section heading</span>],
        ["text-base / 400", <span>Body copy sets the measure at 58–70 characters.</span>],
        ["text-sm / 400", <span className="text-sm text-fg-muted">Secondary copy, the default inside components.</span>],
        [
          "caption — mono 0.6875rem / 600 / 0.1em",
          <span className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-fg-subtle">
            Events today
          </span>,
        ],
        ["figure — mono tabular / 600", <span className="font-mono text-2xl font-semibold tabular-nums">1,284,940</span>],
        [
          "eyebrow — mono 0.75rem / 0.14em",
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle">
            Pipeline health
          </span>,
        ],
      ].map(([label, sample], index) => (
        <div key={index} className="grid gap-1 py-3">
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.1em] text-fg-subtle">{label}</span>
          {sample}
        </div>
      ))}
    </div>
  ),
}

export const ElevationAndRadius: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Three shadow tokens, each with one job. Anything that covers something else takes `shadow-overlay` — dialog, side panel, menu, toast, popover, open tile — so *floating* always looks the same. Containment is an inset **ring**, never a border: rings do not change an element's size, so nested containers stay aligned.",
      },
    },
  },
  render: () => (
    <Stage>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid min-h-24 place-items-center rounded-lg bg-surface font-mono text-sm text-fg-muted shadow-raised ring-1 ring-inset ring-edge">
          shadow-raised
        </div>
        <div className="grid min-h-24 place-items-center rounded-lg bg-surface font-mono text-sm text-fg-muted shadow-hover ring-1 ring-inset ring-edge-strong">
          shadow-hover
        </div>
        <div className="grid min-h-24 place-items-center rounded-lg bg-surface-raised font-mono text-sm text-fg-muted shadow-overlay ring-1 ring-inset ring-edge-strong">
          shadow-overlay
        </div>
        <div className="grid min-h-24 place-items-center rounded-lg bg-surface font-mono text-sm text-fg-muted ring-1 ring-inset ring-edge">
          ring only (flat)
        </div>
      </div>
      <DemoLabel>Radius</DemoLabel>
      <div className="flex flex-wrap gap-3">
        {["rounded-sm", "rounded-md", "rounded-lg", "rounded-xl"].map((radius) => (
          <div
            key={radius}
            className={`grid h-12 w-24 place-items-center bg-surface font-mono text-[0.6875rem] text-fg-muted ring-1 ring-inset ring-edge ${radius}`}
          >
            {radius.replace("rounded-", "")}
          </div>
        ))}
      </div>
    </Stage>
  ),
}

const ICON_NAMES = [
  "House",
  "ChartBar",
  "Table",
  "Gear",
  "UsersThree",
  "Plus",
  "Check",
  "CheckCircle",
  "WarningCircle",
  "Info",
  "X",
  "CaretDown",
  "MagnifyingGlass",
  "DotsThree",
  "ArrowsLeftRight",
  "Trash",
  "NotePencil",
  "List",
  "Clock",
  "Sparkle",
] as const

export const IconSet: Story = {
  name: "Icons",
  parameters: {
    docs: {
      description: {
        story:
          "The approved Phosphor surface, at regular weight. What the system adds is *where* they sit: an icon labelling a region goes in a tinted chip (Section, StatCard, TableSection), an icon inside a control is bare and inherits the control's colour. Import from `@figuredout/ui-web/icons` — never from `@phosphor-icons/react` directly, or the approved set stops meaning anything.",
      },
    },
  },
  render: () => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-2">
      {ICON_NAMES.map((name) => {
        const Icon = Icons[name] as (props: { size?: number }) => JSX.Element
        return (
          <div
            key={name}
            className="grid place-items-center gap-2 rounded-md bg-surface px-2 py-3 text-center font-mono text-[0.625rem] text-fg-subtle ring-1 ring-inset ring-edge"
          >
            <span className="text-fg">
              <Icon size={20} />
            </span>
            <span className="[overflow-wrap:anywhere]">{name}</span>
          </div>
        )
      })}
    </div>
  ),
}
