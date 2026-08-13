import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  Badge,
  Button,
  DescriptionList,
  EmptyState,
  Pagination,
  SeamGrid,
  StatCard,
  StatCardContent,
  Table,
  TableSection,
} from "../index"
import { Clock, Plus, Target, Tray } from "../src/icons/index"
import { DemoLabel, Stage, numberFormat, rowTone, sourceRows, statusTone } from "./demo-data"
import type { SourceRow } from "./demo-data"

const meta = {
  title: "Data",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Everything that shows a figure or a record. The rule running through this section: a set of related values is one object, and every value that is a number is mono and tabular so a column of them can be read down.",
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const columns = [
  { id: "name", header: "Source", sortValue: (row: SourceRow) => row.name, render: (row: SourceRow) => row.name },
  { id: "owner", header: "Owner", render: (row: SourceRow) => row.owner },
  {
    id: "status",
    header: "Status",
    render: (row: SourceRow) => (
      <Badge tone={statusTone[row.status]} dot>
        {row.status}
      </Badge>
    ),
  },
  {
    id: "rows",
    header: "Rows",
    align: "right" as const,
    sortValue: (row: SourceRow) => row.rows,
    render: (row: SourceRow) => <span className="font-mono tabular-nums">{numberFormat.format(row.rows)}</span>,
  },
]

export const Stats: Story = {
  name: "StatCard, SeamGrid",
  parameters: {
    docs: {
      description: {
        story:
          "A row of related figures is **one object**, not four cards that happen to be near each other: `SeamGrid` draws the hairline between cells as a 1px gap over a seam-coloured ground, so there are no doubled borders and no page showing through. Use `StatCardContent` inside it — the grid owns the surface, padding and corners.\n\nPass a child count that divides evenly by every step (4 → 2 → 1). A hole in a grid of hairlines reads as a missing figure. `StatCard` on its own still carries its own surface, for the single-metric case.",
      },
    },
  },
  render: () => (
    <Stage>
      <DemoLabel>Connected — the default for a row of related figures</DemoLabel>
      <SeamGrid columns={4}>
        <div>
          <StatCardContent title="Events today" value="1,284,940" delta="+12%" tone="success" description="vs 1,146,201 yesterday" />
        </div>
        <div>
          <StatCardContent title="Median latency" value="412 ms" description="p95 is 1.9 s" />
        </div>
        <div>
          <StatCardContent title="Failed syncs" value="3" description="All retried and clear" />
        </div>
        <div>
          <StatCardContent title="Cost this month" value="$4,120" description="Budget $6,000" />
        </div>
      </SeamGrid>

      <DemoLabel>Standalone</DemoLabel>
      <div className="max-w-xs">
        <StatCard title="Active models" value="37" delta="+4 this week" tone="primary" description="2 pending review" icon={<Target size={18} />} />
      </div>
    </Stage>
  ),
}

export const Descriptions: Story = {
  name: "DescriptionList",
  parameters: {
    docs: {
      description: {
        story:
          "Facts about one thing, so it is a seam grid too — the package rendered separate rounded blocks with gaps, which reads as unrelated cards. Terms take the mono caption role; values that are numbers are tabular.",
      },
    },
  },
  render: () => (
    <Stage>
      <DescriptionList
        items={[
          { label: "Connection", value: <span className="font-mono">snowflake://prod-analytics</span> },
          { label: "Owner", value: "Data Platform" },
          { label: "Schedule", value: "Hourly, at :05" },
          { label: "Last landed", value: <span className="font-mono tabular-nums">4 min ago</span> },
          { label: "Rows today", value: <span className="font-mono tabular-nums">1,284,940</span> },
          {
            label: "Status",
            value: (
              <Badge tone="success" dot>
                Healthy
              </Badge>
            ),
          },
        ]}
      />
    </Stage>
  ),
}

export const Tables: Story = {
  name: "Table",
  parameters: {
    docs: {
      description: {
        story:
          "**One table, not two variants.** `framed` is a boolean and defaults to false: the frame belongs to whatever holds the table, so inside a Card, Section or TableSection you get the table only. Two frames read as a box in a box.\n\nRow tone is a bar on the leading cell plus the faintest wash — the bar is drawn from the tone directly rather than from `currentColor`, because tinting the cell's text to feed the shadow also tinted the row's most important label. Sortable columns move the caption to `primary` and carry `aria-sort`.",
      },
    },
  },
  render: () => (
    <Stage>
      <DemoLabel>framed — the standalone case</DemoLabel>
      <Table
        framed
        columns={columns}
        data={sourceRows}
        rowKey={(row) => row.id}
        rowTone={(row) => rowTone[row.status]}
      />
      <DemoLabel>unframed — inside any container</DemoLabel>
      <Table columns={columns} data={sourceRows.slice(0, 3)} rowKey={(row) => row.id} stickyHeader={false} />
    </Stage>
  ),
}

export const TableSections: Story = {
  name: "TableSection",
  parameters: {
    docs: {
      description: {
        story:
          "Icon chip, title, description, actions, table, caption. It is the composition that proves the one-table rule: the same table as above, with no frame, because the section is the container.",
      },
    },
  },
  render: () => (
    <Stage>
      <TableSection
        icon={<Clock size={16} />}
        title="Recent runs"
        description="The last three executions, newest first."
        caption="Durations exclude queue time. Rows counted after de-duplication."
        actions={
          <Button size="sm" variant="secondary">
            Export CSV
          </Button>
        }
        columns={columns}
        data={sourceRows.slice(0, 3)}
        rowKey={(row) => row.id}
        stickyHeader={false}
      />
    </Stage>
  ),
}

export const Pages: Story = {
  name: "Pagination",
  parameters: {
    docs: {
      description: {
        story:
          "Page numbers live in the same sunken track as Tabs with the current page raised out of it — one segmented-control idiom, so a reader who has learned one has learned the other. Prev/Next stay secondary buttons and disable at the ends.",
      },
    },
  },
  render: function PaginationStory() {
    const [page, setPage] = useState(3)
    return (
      <Stage>
        <Pagination currentPage={page} totalPages={8} onPageChange={setPage} />
      </Stage>
    )
  },
}

export const Empty: Story = {
  name: "EmptyState",
  parameters: {
    docs: {
      description: {
        story:
          "**No dashed border.** A dashed rectangle means \"drop something here\", which is a different component; an empty table is simply empty. `Table` falls back to this automatically when `data` is empty.",
      },
    },
  },
  render: () => (
    <Stage>
      <EmptyState
        icon={<Tray size={22} />}
        title="No records yet"
        description="This table fills in as soon as a source lands its first batch. Nothing is wrong."
        action={
          <Button size="sm" leadingIcon={<Plus size={14} />}>
            Connect a source
          </Button>
        }
      />
    </Stage>
  ),
}
