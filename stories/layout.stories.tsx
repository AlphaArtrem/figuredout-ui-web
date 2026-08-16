import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  AppTopBar,
  Badge,
  Button,
  DashboardShell,
  Hero,
  InfoBanner,
  PageBand,
  PageContent,
  PageHeader,
  Section,
  SeamGrid,
  SettingsSection,
  Skeleton,
  StatCardContent,
  Switch,
} from "../index"
import { ChartBar, Gear, House, Plus, Table, Target } from "../src/icons/index"
import { DemoLabel, Stage } from "./demo-data"

const meta = {
  title: "Layout",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The components that decide where a page's content sits. Page width comes from `--measure` and `--gut`, so it stops being redecided in every app.",
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const HeroStory: Story = {
  name: "Hero",
  parameters: {
    docs: {
      description: {
        story:
          "For marketing and landing surfaces. Two columns on a laptop — art with a figures card riding up over its bottom quarter, words beside it. Under 880px the art and the words share one grid cell: the art hangs from the top at a capped width and the copy drops below the raised arm.\n\nThe asset must be square within about 1%: the `-25%` overlap and the `64%` copy offset are both derived from that ratio, so a different aspect ratio means recomputing them, not just swapping the file. Resize the preview to watch the copy stay clear.",
      },
    },
  },
  render: () => (
    <Hero
      eyebrow="FiguredOut / Platform"
      title={
        <>
          Every number.
          <br />
          Traced to <em className="not-italic text-primary">its source.</em>
        </>
      }
      description="One warehouse-backed layer for every metric your teams argue about."
      art={<div className="aspect-square w-full rounded-xl bg-[linear-gradient(140deg,var(--color-primary-soft),var(--color-surface-sunken))] ring-1 ring-inset ring-edge" />}
      card={
        <div className="overflow-hidden rounded-xl bg-surface shadow-raised ring-1 ring-inset ring-edge">
          {[
            ["Events today", "1,284,940"],
            ["Sources connected", "17"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 border-b border-edge px-5 py-4 last:border-b-0">
              <span className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-fg-subtle">
                {label}
              </span>
              <span className="font-mono text-xl font-semibold tabular-nums text-fg">{value}</span>
            </div>
          ))}
        </div>
      }
      actions={
        <>
          <Button>Open the dashboard</Button>
          <Button variant="secondary">See a live example</Button>
        </>
      }
    />
  ),
}

export const PageBands: Story = {
  name: "PageBand",
  parameters: {
    docs: {
      description: {
        story:
          "Content stays inside the measure; the rules between sections run edge to edge. That is why the band carries the divider and the inner wrapper carries the width — a divider that stops at the content edge reads as an underline on the section above it.",
      },
    },
  },
  render: () => (
    <div>
      <PageBand divided={false} spacing="normal">
        <Section variant="plain" size="display" eyebrow="First band" title="Bands stack" description="Each band is a page-level region. The first one usually has no divider above it." icon={<ChartBar size={20} />}>
          <Skeleton className="h-16" />
        </Section>
      </PageBand>
      <PageBand spacing="normal">
        <Section variant="plain" eyebrow="Second band" title="The rule runs edge to edge" description="While the content stays inside --measure." icon={<Table size={20} />}>
          <Skeleton className="h-16" />
        </Section>
      </PageBand>
    </div>
  ),
}

export const PageHeaders: Story = {
  name: "PageHeader",
  parameters: {
    docs: {
      description: {
        story:
          "Type on the page ground with a rule under it, not a card. The package wrapped this in the same padded shell as Card and Section, which made the top of every page a box inside a box — the title *is* the page, it does not need a container to say so.",
      },
    },
  },
  render: () => (
    <Stage>
      <PageHeader
        breadcrumb={
          <span className="flex flex-wrap items-center gap-2">
            <a href="#top">Sources</a>
            <span aria-hidden="true">/</span>
            <a href="#top">Warehouses</a>
            <span aria-hidden="true">/</span>
            <span>Snowflake</span>
          </span>
        }
        eyebrow="Connected source"
        title="Snowflake — prod-analytics"
        description="Hourly incremental load across 42 tables. Owned by the Data Platform team."
        actions={
          <>
            <Button variant="secondary">Run now</Button>
            <Button>Edit source</Button>
          </>
        }
      />
    </Stage>
  ),
}

export const Sections: Story = {
  name: "Section, SettingsSection",
  parameters: {
    docs: {
      description: {
        story:
          "`plain` puts an icon chip and a mono eyebrow in a 10rem rail beside the heading, with a divider above — use it for page regions. `size=\"display\"` gives it the page-level scale; reserve that for the two or three regions a page is navigated by.\n\n`card` is the same two-surface object as Card, so a Section and a Card read as one family at two sizes. `SettingsSection` is the card variant pinned to `surface`.",
      },
    },
  },
  render: () => (
    <Stage>
      <DemoLabel>variant=&quot;plain&quot; size=&quot;display&quot;</DemoLabel>
      <Section
        variant="plain"
        size="display"
        eyebrow="Delivery"
        title="Where results land"
        description="Every destination this model writes to, and the last time each one accepted a write."
        icon={<Target size={20} />}
      >
        <SeamGrid columns={2}>
          <div>
            <StatCardContent title="Destinations" value="6" />
          </div>
          <div>
            <StatCardContent title="Last write" value="4 min ago" />
          </div>
        </SeamGrid>
      </Section>

      <DemoLabel>variant=&quot;card&quot;</DemoLabel>
      <SettingsSection
        title="Retention"
        description="How long raw events are kept before they are rolled up."
        actions={
          <Button size="sm" variant="secondary" leadingIcon={<Gear size={14} />}>
            Edit
          </Button>
        }
      >
        <div className="grid gap-4">
          <Switch label="Roll up events older than 90 days" defaultChecked />
          <Switch label="Delete raw payloads after roll-up" />
        </div>
      </SettingsSection>
    </Stage>
  ),
}

export const TopBar: Story = {
  name: "AppTopBar",
  parameters: {
    docs: {
      description: {
        story:
          "Mono title, wrapping nav, actions pushed right. The active nav item's underline is a scaled pseudo-element that grows from the centre, replacing a border that nudged the label by a pixel when it appeared. Ambient state — environment chips, connection badges — is left to the app: below `md` the bar wraps onto three rows, and where that state belongs then is a per-app call rather than something this component should decide.",
      },
    },
  },
  render: () => (
    <AppTopBar
      sticky={false}
      logo={
        <span className="inline-grid size-7 place-items-center rounded-sm bg-primary-soft text-primary ring-1 ring-inset ring-primary/30">
          <ChartBar size={16} />
        </span>
      }
      title="FiguredOut"
      navItems={[
        { label: "Overview", href: "#overview", active: true },
        { label: "Sources", href: "#sources" },
        { label: "Models", href: "#models" },
        { label: "Alerts", href: "#alerts" },
      ]}
      actions={
        /* `sr-only` rather than `hidden`: the label still names the button for a
         * screen reader on a phone, where only the icon is drawn. */
        <Button size="sm" leadingIcon={<Plus size={14} />}>
          <span className="sr-only sm:not-sr-only">Invite</span>
        </Button>
      }
    />
  ),
}

export const Shell: Story = {
  name: "DashboardShell",
  parameters: {
    docs: {
      description: {
        story:
          "Persistent sidebar, sticky action bar, mobile drawer. The sidebar sits on `surface` against a `bg` content area, so the two regions separate without a heavy divider; the active item is marked by an inset bar that cannot shift its label.",
      },
    },
  },
  render: () => (
    <div className="h-[28rem] overflow-hidden rounded-xl ring-1 ring-inset ring-edge">
      <DashboardShell
        title="FiguredOut"
        subtitle="prod-analytics"
        activeItemId="overview"
        navItems={[
          { id: "overview", label: "Overview", icon: <House size={18} /> },
          { id: "sources", label: "Sources", icon: <Table size={18} /> },
          { id: "models", label: "Models", icon: <ChartBar size={18} /> },
          { id: "settings", label: "Settings", icon: <Gear size={18} /> },
        ]}
        status={
          <Badge tone="success" dot>
            All systems normal
          </Badge>
        }
        actions={
          <Button size="sm" leadingIcon={<Plus size={14} />}>
            New sync
          </Button>
        }
      >
        <div className="p-6">
          <PageContent>
            <SeamGrid columns={3}>
              <div>
                <StatCardContent title="Events" value="1.28M" />
              </div>
              <div>
                <StatCardContent title="Latency" value="412 ms" />
              </div>
              <div>
                <StatCardContent title="Failed" value="3" />
              </div>
            </SeamGrid>
            <InfoBanner tone="info" title="Backfill in progress" description="Counts will move until it finishes." />
          </PageContent>
        </div>
      </DashboardShell>
    </div>
  ),
}

export const Content: Story = {
  name: "PageContent",
  parameters: {
    docs: {
      description: {
        story:
          "A layout primitive with no appearance: a column with a `--space-6` rhythm and bottom padding. It exists so page-level spacing is one decision rather than a guess per screen.",
      },
    },
  },
  render: () => (
    <Stage>
      <PageContent>
        <Skeleton className="h-10 w-2/5" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </PageContent>
    </Stage>
  ),
}
