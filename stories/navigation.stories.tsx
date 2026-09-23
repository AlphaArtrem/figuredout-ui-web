import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  Badge,
  BottomNav,
  Button,
  CommandPalette,
  DescriptionList,
  DropdownMenu,
  ExpandableTile,
  FilterBar,
  SearchInput,
  SegmentedControl,
  SelectMenu,
  Stepper,
  Tabs,
  useCommandPaletteShortcut,
} from "../index"
import {
  ChartBar,
  ChatCircleDots,
  Clock,
  Gear,
  House,
  List,
  MagnifyingGlass,
  NotePencil,
  Plus,
  Sun,
  Table,
  Trash,
  UsersThree,
} from "../src/icons/index"
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
          "A seam grid, because steps are a sequence and three gapped cards do not say \"then\". The current step takes the primary wash and `aria-current=\"step\"`, completed steps a success mark.\n\n`variant=\"compact\"` is one line — \"Step n of N\" over a thin track — with the ordered list kept for assistive technology. `compactBelow=\"lg\"` shows that line below `lg` and the full list from it.",
      },
    },
  },
  render: () => (
    <Stage>
      <DemoLabel>List</DemoLabel>
      <Stepper
        currentStep="tables"
        steps={[
          { id: "connect", title: "Connect", description: "Credentials verified" },
          { id: "tables", title: "Choose tables", description: "42 of 128 selected" },
          { id: "schedule", title: "Schedule", description: "Not started" },
        ]}
      />
      <DemoLabel>Compact</DemoLabel>
      <Stepper
        variant="compact"
        currentStep="tables"
        steps={[
          { id: "connect", title: "Connect" },
          { id: "tables", title: "Choose tables" },
          { id: "schedule", title: "Schedule" },
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

export const Segmented: Story = {
  name: "SegmentedControl",
  parameters: {
    docs: {
      description: {
        story:
          "The `Tabs` track without the panel: a sunken hole with the chosen segment lifted out of it. Use it when the choice filters or switches something that lives elsewhere — a list below, a chart's range. It is a `radiogroup` by default (one Tab stop; arrows move **and** select, skipping disabled segments), or a row of `aria-pressed` toggles with `semantics=\"pressed\"`. Counts are mono tabular figures and are part of each segment's name.",
      },
    },
  },
  render: function SegmentedStory() {
    const [filter, setFilter] = useState("all")
    const [range, setRange] = useState("30d")
    const [view, setView] = useState("list")
    return (
      <Stage>
        <DemoLabel>With counts · full width</DemoLabel>
        <div className="max-w-sm">
          <SegmentedControl
            label="Conversation filter"
            fullWidth
            size="sm"
            value={filter}
            onValueChange={setFilter}
            options={[
              { value: "all", label: "All", count: 47 },
              { value: "needs-you", label: "Needs you", count: 3 },
              { value: "assistant", label: "Assistant", count: 12 },
              { value: "closed", label: "Closed" },
            ]}
          />
        </div>
        <DemoLabel>Default size · one disabled</DemoLabel>
        <SegmentedControl
          label="Date range"
          value={range}
          onValueChange={setRange}
          options={[
            { value: "7d", label: "7 days" },
            { value: "30d", label: "30 days" },
            { value: "90d", label: "90 days" },
            { value: "all", label: "All time", disabled: true },
          ]}
        />
        <DemoLabel>Pressed semantics · icons</DemoLabel>
        <SegmentedControl
          label="View"
          semantics="pressed"
          value={view}
          onValueChange={setView}
          options={[
            { value: "list", label: "List", icon: <List size={16} aria-hidden="true" /> },
            { value: "chart", label: "Chart", icon: <ChartBar size={16} aria-hidden="true" /> },
          ]}
        />
      </Stage>
    )
  },
}

export const Palette: Story = {
  name: "CommandPalette, useCommandPaletteShortcut",
  parameters: {
    docs: {
      description: {
        story:
          "A modal search over everything the app can open or do — press **⌘K / Ctrl+K** anywhere on this story, or use the button. Focus goes to the field and stays there: Up/Down move through every group (and wrap), Enter chooses, Escape closes and focus returns to where it was. Filtering is built in over the title, a string subtitle and `keywords`; pass `filter={false}` when the app searches for itself. Shortcut hints are shown, not bound.",
      },
    },
  },
  render: function PaletteStory() {
    const [open, setOpen] = useState(false)
    const [last, setLast] = useState<string | null>(null)
    useCommandPaletteShortcut(() => setOpen((current) => !current))
    const tile = (icon: React.ReactNode) => (
      <span aria-hidden="true" className="grid size-8 place-items-center rounded-md bg-primary-soft text-primary">
        {icon}
      </span>
    )
    const figure = (value: string) => (
      <span aria-hidden="true" className="grid size-8 place-items-center rounded-md bg-success-soft font-mono text-xs font-semibold tabular-nums text-success">
        {value}
      </span>
    )
    return (
      <Stage>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" leadingIcon={<MagnifyingGlass size={16} aria-hidden="true" />} onClick={() => setOpen(true)}>
            Search
          </Button>
          {last ? <span className="text-sm text-fg-muted">Chose: {last}</span> : null}
        </div>
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          onSelect={(item) => setLast(String(item.title))}
          groups={[
            {
              id: "people",
              label: "People",
              items: [
                { id: "ritika", title: "Ritika Kaul", subtitle: "Score 94 · shortlisted", icon: figure("94"), shortcut: ["↵"] },
                { id: "rahul", title: "Rahul Sethi", subtitle: "Score 38 · closed", icon: figure("38") },
              ],
            },
            {
              id: "sources",
              label: "Sources",
              items: [{ id: "snowflake", title: "Snowflake — prod", subtitle: "Healthy · 42 tables", icon: tile(<Table size={16} />) }],
            },
            {
              id: "actions",
              label: "Actions",
              items: [
                { id: "add", title: "Add a source", icon: tile(<Plus size={16} />), shortcut: ["⌘", "L"] },
                { id: "settings", title: "Open settings", icon: tile(<Gear size={16} />), shortcut: ["⌘", ","] },
                { id: "theme", title: "Switch to light mode", icon: tile(<Sun size={16} />), shortcut: ["⌘", "⇧", "L"], keywords: ["theme", "dark"] },
                { id: "billing", title: "Billing", subtitle: "Owners only", icon: tile(<Clock size={16} />), disabled: true },
              ],
            },
          ]}
        />
      </Stage>
    )
  },
}

export const Bottom: Story = {
  name: "BottomNav",
  parameters: {
    docs: {
      description: {
        story:
          "A phone's primary navigation. Up to five items, each at least 52px tall; the active one is `aria-current=\"page\"` in the primary hue. A count badge is decoration — its words (`badgeLabel`) are in the item's name. Items are buttons reporting an id, like `DashboardShell`'s, unless they carry `href`; `renderLink` draws those with the app's router link. It clears the home indicator with `env(safe-area-inset-bottom)` (needs `viewport-fit=cover`). `fixed` pins it to the viewport; by default it is the last row of a full-height column, as here.",
      },
    },
  },
  render: function BottomNavStory() {
    const [active, setActive] = useState("inbox")
    return (
      <Stage>
        <div className="mx-auto flex h-[28rem] w-full max-w-[24.375rem] flex-col overflow-hidden rounded-xl bg-background ring-1 ring-inset ring-edge">
          <div className="grid min-h-0 flex-1 place-items-center p-4 text-sm text-fg-muted">Screen: {active}</div>
          <BottomNav
            activeItemId={active}
            onItemSelect={setActive}
            items={[
              { id: "home", label: "Today", icon: <House size={21} />, activeIcon: <House size={21} weight="fill" /> },
              { id: "inbox", label: "Inbox", icon: <ChatCircleDots size={21} />, activeIcon: <ChatCircleDots size={21} weight="fill" />, badge: 3, badgeLabel: "3 unread" },
              { id: "people", label: "People", icon: <UsersThree size={21} />, activeIcon: <UsersThree size={21} weight="fill" />, badge: 128 },
              { id: "numbers", label: "Numbers", icon: <ChartBar size={21} />, activeIcon: <ChartBar size={21} weight="fill" /> },
              { id: "more", label: "More", icon: <List size={21} /> },
            ]}
          />
        </div>
      </Stage>
    )
  },
}
