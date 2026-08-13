import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  Badge,
  Button,
  DescriptionList,
  DropdownMenu,
  ExpandableTile,
  FilterBar,
  SearchInput,
  SelectMenu,
  Stepper,
  Tabs,
} from "../index"
import { Clock, NotePencil, Table, Trash } from "../src/icons/index"
import { DemoLabel, Stage } from "./demo-data"

const meta = {
  title: "Navigation & input",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Controls that move a reader through a view or narrow what is in it. Two idioms recur: a **segmented control** on a sunken track (Tabs, Pagination), and a **popover** on the shared floating surface (SelectMenu, DropdownMenu).",
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const TabsStory: Story = {
  name: "Tabs",
  parameters: {
    docs: {
      description: {
        story:
          "The track is sunken and the active tab is raised out of it. The package had that inverted — a raised track with the active tab on `surface` — which on the light ladder made the selected tab look recessed, the opposite of what selection means. Arrow keys, Home/End and the badge slot are unchanged.",
      },
    },
  },
  render: () => (
    <Stage>
      <Tabs
        items={[
          { id: "overview", label: "Overview", content: <p className="m-0 text-sm text-fg-muted">Hourly incremental load across 42 tables.</p> },
          { id: "schema", label: "Schema", badge: "42", content: <p className="m-0 text-sm text-fg-muted">Three columns changed type in the last 7 days.</p> },
          { id: "runs", label: "Runs", description: "Median duration 2m 06s.", content: <p className="m-0 text-sm text-fg-muted">4,201 runs recorded.</p> },
          { id: "billing", label: "Billing", disabled: true, content: null },
        ]}
      />
    </Stage>
  ),
}

export const Filters: Story = {
  name: "FilterBar, SearchInput",
  parameters: {
    docs: {
      description: {
        story:
          "A single ringed strip on `surface` holding the controls that scope the view below it. Because fields are sunken now, the bar reads as a rail with holes in it rather than as a card containing more cards. `SearchInput` shows its clear button only when there is a value.",
      },
    },
  },
  render: function FilterStory() {
    const [query, setQuery] = useState("checkout.completed")
    const [owner, setOwner] = useState("all")
    return (
      <Stage>
        <FilterBar
          actions={
            <>
              <Button size="sm" variant="ghost">
                Reset
              </Button>
              <Button size="sm">Apply</Button>
            </>
          }
        >
          <div className="min-w-0 flex-1">
            <SearchInput placeholder="Search sources" value={query} onChange={(event) => setQuery(event.target.value)} onClear={() => setQuery("")} />
          </div>
          <div className="w-full md:w-48">
            <SelectMenu
              value={owner}
              onChange={setOwner}
              options={[
                { value: "all", label: "All owners" },
                { value: "platform", label: "Data Platform" },
                { value: "billing", label: "Billing" },
              ]}
            />
          </div>
        </FilterBar>
        <DemoLabel>Empty search — no clear button</DemoLabel>
        <div className="max-w-sm">
          <SearchInput placeholder="Search 1,284 events" value="" onChange={() => {}} />
        </div>
      </Stage>
    )
  },
}

export const Selects: Story = {
  name: "SelectMenu",
  parameters: {
    docs: {
      description: {
        story:
          "The listbox for options that need descriptions or disabled states — **and the only dropdown whose list is themed**. A native `<select>` popup is drawn by the OS and stays light on a dark page whatever CSS asks for, so reach for this whenever the list has to match the theme.\n\nIts popover is the shared floating surface: raised, overlay shadow, strong ring, 4px padding so a highlighted row's radius nests inside the container's.",
      },
    },
  },
  render: function SelectStory() {
    const [value, setValue] = useState("snowflake")
    return (
      <Stage>
        <div className="max-w-sm">
          <SelectMenu
            label="Destination"
            value={value}
            onChange={setValue}
            options={[
              { value: "snowflake", label: "Snowflake — prod-analytics", description: "Hourly, 42 tables" },
              { value: "bigquery", label: "BigQuery — eu-west", description: "Daily, 12 tables" },
              { value: "redshift", label: "Redshift — legacy", description: "Decommissioned", disabled: true },
            ]}
          />
        </div>
      </Stage>
    )
  },
}

export const Menus: Story = {
  name: "DropdownMenu",
  parameters: {
    docs: {
      description: {
        story:
          "Button or icon trigger, optional per-item description, danger tone. `align` picks the edge it hangs from, and it has no safe default: right for a control at the end of a row, left for one at the start. A menu that runs off its container is the most common overlay bug.",
      },
    },
  },
  render: () => (
    <Stage>
      <div className="flex flex-wrap items-center gap-3">
        <DropdownMenu
          align="start"
          items={[
            { label: "Edit source", description: "Name, schedule, credentials", icon: <NotePencil size={16} /> },
            { label: "Run now", icon: <Clock size={16} /> },
            { label: "Duplicate", description: "Needs write access", icon: <Table size={16} />, disabled: true },
            { label: "Delete source", icon: <Trash size={16} />, tone: "danger" },
          ]}
        />
        <DropdownMenu
          triggerVariant="icon"
          label="Row actions"
          items={[
            { label: "Mark reviewed" },
            { label: "Remove", icon: <Trash size={16} />, tone: "danger" },
          ]}
        />
      </div>
    </Stage>
  ),
}

export const Steps: Story = {
  name: "Stepper",
  parameters: {
    docs: {
      description: {
        story:
          "A seam grid, because steps are a sequence and three gapped cards do not say \"then\". The current step takes the primary wash and `aria-current=\"step\"`, completed steps a success mark.",
      },
    },
  },
  render: () => (
    <Stage>
      <Stepper
        currentStep="tables"
        steps={[
          { id: "connect", title: "Connect", description: "Credentials verified" },
          { id: "tables", title: "Choose tables", description: "42 of 128 selected" },
          { id: "schedule", title: "Schedule", description: "Not started" },
        ]}
      />
    </Stage>
  ),
}

export const Tiles: Story = {
  name: "ExpandableTile",
  parameters: {
    docs: {
      description: {
        story:
          "An open tile is an overlay that stayed where it was: it takes `shadow-overlay` — the elevation the system already reserves for dialogs — plus the raised surface, the strong ring and a 3px lift. The package kept the same surface when a tile opened, so a page of open tiles flattened into one wall of text.\n\nThe marker is +/− rather than a rotating caret: a caret says \"there is more below\", the sign says \"this opens and closes\". Controlled with `open`/`onOpenChange`, or `defaultOpen` for uncontrolled.",
      },
    },
  },
  render: () => (
    <Stage>
      <div className="grid gap-3">
        <ExpandableTile title="What counts as a failed sync?" description="Retries, partial loads, schema drift">
          <p className="m-0">A sync is failed once every retry in its window has been used. Partial loads count as failures even when rows landed.</p>
        </ExpandableTile>
        <ExpandableTile defaultOpen title="Where does the cost number come from?" description="Warehouse billing, not our estimate">
          <DescriptionList
            items={[
              { label: "Source", value: "Warehouse billing export" },
              { label: "Lag", value: "Up to 4 hours" },
            ]}
          />
        </ExpandableTile>
        <ExpandableTile
          title="With a status"
          description="Any node works in the title slot"
          icon={<Table size={18} />}
        >
          <div className="flex items-center gap-2">
            <Badge tone="info" dot>
              Backfilling
            </Badge>
            <span>412,006 rows so far.</span>
          </div>
        </ExpandableTile>
      </div>
    </Stage>
  ),
}
