import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  Avatar,
  Badge,
  Button,
  ConfirmDialog,
  DashboardShell,
  DescriptionList,
  Dialog,
  DropdownMenu,
  EmptyState,
  AppTopBar,
  ExpandableTile,
  FilterBar,
  InfoBanner,
  Input,
  PageHeader,
  Pagination,
  SearchInput,
  SelectMenu,
  Section,
  SidePanel,
  StatCard,
  Table,
  TableSection,
  Tabs,
  useToast,
} from "../index"
import { ChatCircleDots, Gear, ListChecks, Plus, Target, Trash, WarningCircle } from "../src/icons/index"

interface LeadRow {
  id: string
  name: string
  owner: string
  score: number
  status: "New" | "Qualified" | "At risk"
}

const rows: LeadRow[] = [
  { id: "lead-1", name: "Acme Robotics", owner: "Mira Kapoor", score: 92, status: "Qualified" },
  { id: "lead-2", name: "Northstar Labs", owner: "Jon Bell", score: 78, status: "New" },
  { id: "lead-3", name: "Civic Health", owner: "Rhea Stone", score: 64, status: "At risk" },
]

const meta = {
  title: "UI/Patterns",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const WorkspaceHeader: Story = {
  render: () => (
    <div>
      <AppTopBar
        logo={<span className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-primary text-xs font-bold text-primary-fg">FO</span>}
        title="FiguredOut"
        subtitle="Workspace"
        navItems={[
          { href: "#overview", label: "Overview", active: true },
          { href: "#accounts", label: "Accounts" },
          { href: "#activity", label: "Activity" },
        ]}
        actions={
          <>
            <Button variant="secondary" size="sm">Export</Button>
            <Button size="sm" leadingIcon={<Plus size={16} aria-hidden="true" />}>New lead</Button>
          </>
        }
      />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6">
        <PageHeader
          eyebrow="Workspace"
          title="Pipeline overview"
          description="A page header with semantic surfaces, compact copy, and action slots."
          breadcrumb="Home / Leads"
        />
      </main>
    </div>
  ),
}

export const DashboardChrome: Story = {
  render: () => {
    const [activeItemId, setActiveItemId] = useState("overview")
    return (
      <DashboardShell
        logo={<span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-xs font-bold text-primary-fg">FO</span>}
        title="FiguredOut"
        subtitle="Operations"
        activeItemId={activeItemId}
        onNavItemSelect={setActiveItemId}
        status={<Badge tone="success">System online</Badge>}
        actions={<Button size="sm" leadingIcon={<Plus size={16} aria-hidden="true" />}>New record</Button>}
        footer={<Avatar name="Mira Kapoor" subtitle="Admin" />}
        navItems={[
          { id: "overview", label: "Overview", icon: <Target size={18} aria-hidden="true" /> },
          { id: "queue", label: "Review queue", icon: <ListChecks size={18} aria-hidden="true" /> },
          { id: "settings", label: "Settings", icon: <Gear size={18} aria-hidden="true" /> },
        ]}
      >
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-6 lg:px-6">
          <PageHeader
            eyebrow="Dashboard shell"
            title={`${activeItemId} view`}
            description="Persistent sidebar navigation, mobile drawer behavior, and sticky actions for operational dashboards."
          />
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard title="Open" value="128" description="records in scope" />
            <StatCard title="Reviewed" value="42" tone="success" description="today" />
            <StatCard title="Blocked" value="7" tone="warning" description="needs attention" />
          </div>
        </div>
      </DashboardShell>
    )
  },
}

export const SearchAndFilters: Story = {
  render: () => {
    const [query, setQuery] = useState("qualified")
    return (
      <FilterBar
        actions={
          <DropdownMenu
            triggerLabel="More"
            items={[
              { label: "Save view", description: "Keep this filter set" },
              { label: "Reset filters", tone: "danger", icon: <Trash size={16} aria-hidden="true" /> },
            ]}
          />
        }
      >
        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          onClear={() => setQuery("")}
          placeholder="Search leads"
        />
        <Input className="md:max-w-44" placeholder="Owner" />
        <SelectMenu
          className="md:w-52"
          label="Stage"
          value="qualified"
          onChange={() => undefined}
          options={[
            { label: "All stages", value: "" },
            { label: "Qualified", value: "qualified" },
            { label: "At risk", value: "risk" },
          ]}
        />
      </FilterBar>
    )
  },
}

export const DataTable: Story = {
  render: () => (
    <TableSection
      title="Lead table"
      description="A titled table region with built-in scroll and empty state support."
      data={rows}
      rowKey={(row) => row.id}
      rowTone={(row) => row.status === "At risk" ? "warning" : undefined}
      columns={[
        {
          id: "name",
          header: "Lead",
          sortValue: (row) => row.name,
          render: (row) => (
            <Avatar name={row.name} subtitle={row.owner} />
          ),
        },
        {
          id: "status",
          header: "Status",
          sortValue: (row) => row.status,
          render: (row) => (
            <Badge tone={row.status === "Qualified" ? "success" : row.status === "At risk" ? "warning" : "info"}>
              {row.status}
            </Badge>
          ),
        },
        {
          id: "score",
          header: "Score",
          align: "right",
          sortValue: (row) => row.score,
          render: (row) => `${row.score}%`,
        },
      ]}
    />
  ),
}

export const SectionsAndStats: Story = {
  render: () => (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Qualified" value="128" delta="+12%" tone="success" description="vs previous week" icon={<Target size={18} />} />
        <StatCard title="Needs review" value="24" delta="-4%" tone="warning" description="manual decisions" icon={<WarningCircle size={18} />} />
        <StatCard title="Messages" value="842" delta="+31" tone="info" description="sent this week" icon={<ChatCircleDots size={18} />} />
      </div>
      <Section
        title="Business profile"
        description="A section wraps related configuration without introducing nested cards."
        actions={<Button size="sm" variant="secondary" leadingIcon={<Gear size={14} />}>Configure</Button>}
      >
        <DescriptionList
          items={[
            { label: "Industry", value: "B2B SaaS" },
            { label: "Region", value: "United States" },
            { label: "Primary goal", value: "Qualify inbound demand" },
            { label: "Routing", value: "Owner availability and score" },
          ]}
        />
      </Section>
      <Section
        variant="plain"
        eyebrow="Controls"
        title="Review queue"
        description="Plain sections align page content without adding a card shell."
      >
        <div className="grid gap-3">
          <InfoBanner tone="info" title="Review window" description="New records are checked every 15 minutes." />
          <ExpandableTile title="Risk checks" description="Open to review the applied qualification thresholds.">
            <DescriptionList
              items={[
                { label: "Minimum score", value: "70%" },
                { label: "Owner override", value: "Allowed" },
              ]}
            />
          </ExpandableTile>
        </div>
      </Section>
    </div>
  ),
}

export const TabsAndPagination: Story = {
  render: () => {
    const [page, setPage] = useState(2)
    return (
      <div className="grid gap-6">
        <Tabs
          defaultValue="summary"
          items={[
            {
              id: "summary",
              label: "Summary",
              badge: "4",
              description: "High-level account state.",
              content: <p className="text-sm text-fg-muted">A concise summary of the selected record.</p>,
            },
            {
              id: "activity",
              label: "Activity",
              content: <p className="text-sm text-fg-muted">Recent messages, routing decisions, and score changes.</p>,
            },
            {
              id: "disabled",
              label: "Locked",
              disabled: true,
              content: null,
            },
          ]}
        />
        <Pagination currentPage={page} totalPages={8} onPageChange={setPage} />
      </div>
    )
  },
}

export const Overlays: Story = {
  render: () => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [panelOpen, setPanelOpen] = useState(false)
    return (
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
        <Button variant="secondary" onClick={() => setPanelOpen(true)}>Open side panel</Button>
        <Button variant="danger" onClick={() => setConfirmOpen(true)}>Open confirm</Button>
        <Dialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Edit routing rule"
          description="Dialog focus is trapped and restored on close."
          footer={<Button onClick={() => setDialogOpen(false)}>Save rule</Button>}
        >
          <div className="grid gap-4">
            <Input placeholder="Rule name" />
            <p className="text-sm text-fg-muted">Use Escape, the close button, or the overlay to close.</p>
          </div>
        </Dialog>
        <SidePanel
          open={panelOpen}
          onOpenChange={setPanelOpen}
          title="Lead details"
          description="A right-side overlay for contextual workflows."
        >
          <DescriptionList
            items={[
              { label: "Owner", value: "Mira Kapoor" },
              { label: "Score", value: "92%" },
              { label: "Status", value: "Qualified" },
              { label: "Last message", value: "2 hours ago" },
            ]}
          />
        </SidePanel>
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Archive rule"
          body="This removes the rule from active qualification checks."
          confirmTone="danger"
          confirmLabel="Archive"
          onConfirm={() => undefined}
        />
      </div>
    )
  },
}

export const ToastsAndEmptyState: Story = {
  render: () => {
    const toast = useToast()
    return (
      <div className="grid gap-5">
        <EmptyState
          icon={<ListChecks size={22} aria-hidden="true" />}
          title="No rules yet"
          description="Create a qualification rule to start screening inbound leads."
          action={<Button onClick={() => toast.pushToast({ title: "Rule created", description: "This is a preview notification.", tone: "success" })}>Show toast</Button>}
        />
      </div>
    )
  },
}
