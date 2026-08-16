import type { Meta, StoryObj } from "@storybook/react-vite"
import { BarChart, ChartShell, ChartTooltip, DonutChart, FunnelBars, LineChart, Sparkline } from "../src/charts/index"
import { SeamGrid, Section, StatCardContent } from "../index"
import { DemoLabel, Stage, weeklyData } from "./demo-data"

const meta = {
  title: "Charts",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Recharts wrappers. What the design system owns is the **furniture** — legend, axis type, the view-as-table escape hatch, the hover card — because that is what makes a chart look like it belongs to the same product as the table beside it. Series colours come from `categoricalColor()` and the `--chart-*` tokens; never pass a literal.",
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const series = [
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
]

/* Sparkline takes bare label/value pairs — it has no axes to key off. */
const sparkAccepted = weeklyData.map((row) => ({ label: row.week, value: row.accepted }))
const sparkRejected = weeklyData.map((row) => ({ label: row.week, value: row.rejected }))

export const Lines: Story = {
  name: "LineChart",
  parameters: {
    docs: {
      description: {
        story: "Mono axis labels, a hairline grid at `--chart-grid`, and no axis lines. One series per categorical token, in order.",
      },
    },
  },
  render: () => (
    <Stage>
      <LineChart data={weeklyData} xKey="week" series={series} />
    </Stage>
  ),
}

export const Bars: Story = {
  name: "BarChart",
  parameters: {
    docs: {
      description: {
        story: "Grouped bars with the radius token on their top corners. Grid lines run behind the bars and stop at the plot area — a grid line crossing an axis label is the most common chart bug in a system with no chart rules.",
      },
    },
  },
  render: () => (
    <Stage>
      <BarChart data={weeklyData} xKey="week" series={series} />
    </Stage>
  ),
}

export const Donut: Story = {
  name: "DonutChart",
  parameters: {
    docs: {
      description: {
        story: "For parts of one whole, and only when there are few enough parts to label. The centre carries the total as a mono figure with a mono caption under it — the same pairing the stat cells use.",
      },
    },
  },
  render: () => (
    <Stage>
      <DonutChart
        entries={[
          { key: "postgres", label: "Postgres", value: 41 },
          { key: "snowflake", label: "Snowflake", value: 26 },
          { key: "segment", label: "Segment", value: 17 },
          { key: "other", label: "Everything else", value: 16 },
        ]}
      />
    </Stage>
  ),
}

export const Sparklines: Story = {
  name: "Sparkline",
  parameters: {
    docs: {
      description: {
        story: "No axes, no grid, no tooltip — a sparkline is a word in a sentence, not a chart. It takes `--chart-seq` and sits inline beside the figure it belongs to.",
      },
    },
  },
  render: () => (
    <Stage>
      <SeamGrid columns={3}>
        <div>
          <StatCardContent title="Events / hour" value="53.4k" />
          <div className="mt-3">
            <Sparkline data={sparkAccepted} />
          </div>
        </div>
        <div>
          <StatCardContent title="Latency p95" value="1.9s" />
          <div className="mt-3">
            <Sparkline data={sparkRejected} />
          </div>
        </div>
        <div>
          <StatCardContent title="Cost / day" value="$137" />
          <div className="mt-3">
            <Sparkline data={sparkAccepted} />
          </div>
        </div>
      </SeamGrid>
    </Stage>
  ),
}

export const Funnel: Story = {
  name: "FunnelBars",
  parameters: {
    docs: {
      description: {
        story: "Label, track, fill at `--chart-seq` with opacity carrying magnitude, count and percentage in mono. The track carries a ring so an empty stage is still a visible row rather than a blank line.",
      },
    },
  },
  render: () => (
    <Stage>
      <FunnelBars
        entries={[
          { key: "received", label: "Received", count: 1284 },
          { key: "parsed", label: "Parsed", count: 1130 },
          { key: "enriched", label: "Enriched", count: 783 },
          { key: "delivered", label: "Delivered", count: 565 },
          { key: "confirmed", label: "Confirmed", count: 154 },
        ]}
      />
    </Stage>
  ),
}

export const Shell: Story = {
  name: "ChartShell",
  parameters: {
    docs: {
      description: {
        story:
          "The wrapper that gives every chart the same three states — loading (Skeleton), empty (EmptyState), loaded — plus the legend and the **view-as-table** escape hatch. Every chart in a product should go through it, so that no chart is ever the only way to read its own numbers.",
      },
    },
  },
  render: () => (
    <Stage>
      {/* `LineChart` is already a ChartShell consumer — it builds its own legend
       * and table columns from `series`. Wrapping it in a second shell here
       * drew the legend and the view-as-table toggle twice, one belonging to
       * each shell. Every chart in the package goes through the shell, so
       * showing one of them IS showing the shell. */}
      <Section variant="plain" eyebrow="Ingestion" title="Accepted and rejected">
        <LineChart data={weeklyData} xKey="week" series={series} />
      </Section>
      <DemoLabel className="mt-6">Loading and empty come from the same shell</DemoLabel>
      <div className="grid gap-4 md:grid-cols-2">
        <ChartShell data={[]} loading rowKey={() => ""} tableColumns={[]} renderChart={() => null} height={160} />
        <ChartShell data={[]} rowKey={() => ""} tableColumns={[]} renderChart={() => null} />
      </div>
    </Stage>
  ),
}

export const Tooltips: Story = {
  name: "ChartTooltip",
  parameters: {
    docs: {
      description: {
        story:
          "The hover card Recharts renders. It is the same floating surface as every menu and dialog — raised, overlay shadow, strong ring — with a mono caption for the x value and tabular figures for the series, so it agrees with the table showing the same numbers underneath.",
      },
    },
  },
  render: () => (
    <Stage>
      <div className="flex flex-wrap items-start gap-6">
        <ChartTooltip
          active
          label="Week 4 · 22 Jul"
          payload={[
            { name: "Accepted", value: "601,447", color: "var(--chart-cat-1)" },
            { name: "Rejected", value: "8,102", color: "var(--chart-cat-2)" },
          ]}
        />
        <ChartTooltip active label="Snowflake" payload={[{ name: "Share", value: "26.4%", color: "var(--chart-cat-2)" }]} />
      </div>
    </Stage>
  ),
}
