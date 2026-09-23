import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import {
  BarChart,
  ChartShell,
  ChartTooltip,
  DonutChart,
  FunnelBars,
  Gauge,
  Heatmap,
  Legend,
  LineChart,
  ProgressRing,
  RankedBars,
  Sparkline,
  StackedBar,
  StepSegments,
  WeightedSegments,
  categoricalColor,
} from "../src/charts/index"
import { SeamGrid, Section, StatCardContent } from "../index"
import { CheckCircle } from "../src/icons/index"
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

export const Areas: Story = {
  name: "LineChart — area and highlight",
  parameters: {
    docs: {
      description: {
        story:
          "`area` fills under each line with a 12% wash of its own colour, for a trend whose size matters as well as its shape. The fills are not stacked. `highlightIndex` marks one point — the peak, today — with a dashed guide and a ringed dot on every series.",
      },
    },
  },
  render: () => (
    <Stage>
      <LineChart data={weeklyData} xKey="week" series={series} area highlightIndex={3} />
    </Stage>
  ),
}

export const Rings: Story = {
  name: "ProgressRing",
  parameters: {
    docs: {
      description: {
        story:
          "**One value toward a limit or a goal — nothing else.** Plan usage against its cap, setup steps done, a score out of 100. A count with no denominator is a figure, not a ring; parts of one whole are a `StackedBar`; a comparison is `RankedBars`. One ring per value, never a ring per category. The arc stops at full, the label does not: 120% is the fact the reader needs.",
      },
    },
  },
  render: () => (
    <Stage>
      <div className="flex flex-wrap items-center gap-8">
        <ProgressRing label="Plan usage" value={320} max={500} size="lg" caption="of 500" />
        <ProgressRing label="Setup" value={4} max={6} valueLabel="4/6" tone="warning" />
        <ProgressRing label="Setup" value={6} max={6} tone="success" icon={<CheckCircle weight="bold" />} />
        <ProgressRing label="Plan usage" value={560} max={500} tone="danger" />
        <ProgressRing label="Score" value={82} valueLabel="82" size="sm" tone="success" />
        <ProgressRing label="Score" value={0} size="sm" />
      </div>
    </Stage>
  ),
}

export const Gauges: Story = {
  name: "Gauge",
  parameters: {
    docs: {
      description: {
        story:
          "One reading on a bounded scale, where its position on the scale is the point. `marker` draws a tick across the track for a target or last period's value, and is spoken with the value.",
      },
    },
  },
  render: () => (
    <Stage>
      <div className="flex flex-wrap items-end gap-10">
        <Gauge label="Health" value={72} caption="health score" />
        <Gauge label="Utilisation" value={58} max={80} marker={64} size={160} tone="info" caption="of 80 hours" />
      </div>
    </Stage>
  ),
}

export const Steps: Story = {
  name: "StepSegments",
  parameters: {
    docs: {
      description: {
        story:
          "\"n of total\" for a small known total, one segment per step. By default it is warning until complete and success once complete — the question \"n of total\" nearly always answers is *is it finished?*",
      },
    },
  },
  render: () => (
    <Stage>
      <div className="flex flex-wrap items-center gap-8">
        <StepSegments label="Fields collected" value={5} total={7} />
        <StepSegments label="Fields collected" value={7} total={7} />
        <StepSegments label="Checks passed" value={2} total={4} tone="info" size="sm" />
        <StepSegments label="Checks passed" value={3} total={4} showCount={false} />
      </div>
    </Stage>
  ),
}

export const Stacked: Story = {
  name: "StackedBar",
  parameters: {
    docs: {
      description: {
        story:
          "One whole split into its parts. Segments that are statuses take a `tone`; otherwise leave it unset and they take the categorical palette in order. With `onSelect` the legend entries are buttons — the keyboard path — and the segments are clickable too.",
      },
    },
  },
  render: function Render() {
    const [picked, setPicked] = useState<string | null>(null)
    return (
      <Stage>
        <StackedBar
          label="Outcome"
          segments={[
            { key: "passed", label: "Passed", value: 184, tone: "success" },
            { key: "review", label: "Needs review", value: 61, tone: "warning" },
            { key: "failed", label: "Failed", value: 23, tone: "danger" },
          ]}
        />
        <DemoLabel className="mt-4">Categorical, stacked legend, selectable</DemoLabel>
        <div className="max-w-sm">
          <StackedBar
            label="Traffic by channel"
            legendLayout="stacked"
            onSelect={setPicked}
            segments={[
              { key: "direct", label: "Direct", value: 412 },
              { key: "search", label: "Search", value: 288 },
              { key: "referral", label: "Referral", value: 131 },
              { key: "social", label: "Social", value: 64 },
            ]}
          />
        </div>
        <p className="m-0 text-xs text-fg-subtle">Selected: {picked ?? "nothing"}</p>
      </Stage>
    )
  },
}

export const Ranked: Story = {
  name: "RankedBars",
  parameters: {
    docs: {
      description: {
        story:
          "Categories compared on one measure. The leader fills the track unless `max` fixes the scale (100 for scores, so two lists can be compared). `meta` is a quiet note before the value. Selectable rows keep their table semantics: the row is the target, a real button named by the label is what receives focus. `FunnelBars` is this component with a share-of-a-denominator reading.",
      },
    },
  },
  render: () => (
    <Stage>
      <div className="max-w-md">
        <RankedBars
          label="Sessions by source"
          valueFormatter={(value) => value.toLocaleString("en-US")}
          onSelect={() => undefined}
          items={[
            { key: "direct", label: "Direct", value: 1284, meta: "+12%" },
            { key: "search", label: "Search", value: 902 },
            { key: "referral", label: "Referral", value: 413 },
            { key: "email", label: "Email", value: 170, tone: "warning", meta: "below target" },
          ]}
        />
      </div>
    </Stage>
  ),
}

export const Weighted: Story = {
  name: "WeightedSegments",
  parameters: {
    docs: {
      description: {
        story:
          "A total built from weighted parts: each segment's width is its weight, its fill what was earned of it. The shortfall is hatched in warning by default, so a missed point does not depend on telling two hues apart; `shortfall=\"neutral\"` leaves it as track.",
      },
    },
  },
  render: () => {
    const segments = [
      { key: "fit", label: "Fit", value: 36, weight: 40 },
      { key: "reach", label: "Reach", value: 25, weight: 25 },
      { key: "timing", label: "Timing", value: 8, weight: 20 },
      { key: "quality", label: "Quality", value: 15, weight: 15 },
    ]
    return (
      <Stage>
        <div className="grid max-w-lg gap-6">
          <WeightedSegments label="Score by criterion" segments={segments} />
          <WeightedSegments label="Score by criterion" segments={segments} shortfall="neutral" tone="primary" />
        </div>
      </Stage>
    )
  },
}

const HOURS = ["8", "10", "12", "14", "16", "18", "20"]
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const ACTIVITY = [
  [2, 8, 14, 11, 9, 5, 1],
  [3, 10, 16, 12, 10, 6, 2],
  [1, 7, 12, 13, 11, 4, null],
  [4, 11, 18, 15, 12, 7, 3],
  [2, 9, 13, 10, 14, 9, 4],
  [0, 2, 5, 6, 4, 3, 1],
  [0, 1, 3, 2, 2, 1, 0],
]

export const Heat: Story = {
  name: "Heatmap",
  parameters: {
    docs: {
      description: {
        story:
          "A value per row × column. The colour is `--chart-seq` mixed into the track, so the faintest non-zero cell is still a cell and `null` (bare track) is visibly different from zero. It is an HTML table underneath: every value is in the page and a screen reader walks it by header.",
      },
    },
  },
  render: () => (
    <Stage>
      <Heatmap
        label="Activity by weekday and hour"
        rows={DAYS.map((day) => ({ key: day, label: day }))}
        columns={HOURS.map((hour) => ({ key: hour, label: hour }))}
        values={ACTIVITY}
      />
      <DemoLabel className="mt-4">With values printed</DemoLabel>
      <Heatmap
        label="Activity by weekday and hour"
        rows={DAYS.slice(0, 3).map((day) => ({ key: day, label: day }))}
        columns={HOURS.map((hour) => ({ key: hour, label: hour }))}
        values={ACTIVITY.slice(0, 3)}
        showValues
        showScale={false}
      />
    </Stage>
  ),
}

export const Legends: Story = {
  name: "Legend",
  parameters: {
    docs: {
      description: {
        story:
          "Swatch, label and optional value. `ChartShell` draws its series legend with it, and `StackedBar` its segments, so every chart's key looks the same. Colours resolve like the charts: an explicit colour, then a tone, then the categorical palette by position.",
      },
    },
  },
  render: () => (
    <Stage>
      <Legend
        items={[
          { key: "a", label: "Direct", value: "412" },
          { key: "b", label: "Search", value: "288" },
          { key: "c", label: "Referral", color: categoricalColor(2) },
        ]}
      />
      <div className="max-w-xs">
        <Legend
          layout="stacked"
          items={[
            { key: "ok", label: "Passed", tone: "success", value: "184" },
            { key: "warn", label: "Needs review", tone: "warning", value: "61" },
            { key: "bad", label: "Failed", tone: "danger", value: "23" },
          ]}
        />
      </div>
    </Stage>
  ),
}
