/**
 * Sample data shared by the story sections.
 *
 * One source so every section shows the same product — a reader comparing a
 * Table against a SeamGrid against a chart should be looking at the same
 * numbers, not at three unrelated inventions.
 */

export interface SourceRow {
  id: string
  name: string
  owner: string
  rows: number
  status: "Healthy" | "Degraded" | "Failing" | "Backfilling"
}

export const sourceRows: SourceRow[] = [
  { id: "snowflake", name: "Snowflake — prod", owner: "Data Platform", rows: 1284940, status: "Healthy" },
  { id: "salesforce", name: "Salesforce", owner: "Revenue Ops", rows: 88204, status: "Degraded" },
  { id: "stripe", name: "Stripe webhook", owner: "Billing", rows: 0, status: "Failing" },
  { id: "segment", name: "Segment", owner: "Growth", rows: 412006, status: "Backfilling" },
  { id: "postgres", name: "Postgres — app", owner: "Core", rows: 2041777, status: "Healthy" },
]

export const statusTone = {
  Healthy: "success",
  Degraded: "warning",
  Failing: "danger",
  Backfilling: "info",
} as const

export const rowTone = {
  Healthy: undefined,
  Degraded: "warning",
  Failing: "danger",
  Backfilling: "info",
} as const

export const weeklyData = [
  { week: "W1", accepted: 402, rejected: 82 },
  { week: "W2", accepted: 488, rejected: 79 },
  { week: "W3", accepted: 470, rejected: 85 },
  { week: "W4", accepted: 601, rejected: 81 },
  { week: "W5", accepted: 640, rejected: 73 },
  { week: "W6", accepted: 712, rejected: 69 },
]

export const numberFormat = new Intl.NumberFormat("en-US")

/** A section heading inside a story, for the multi-part demos. */
export function DemoLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-fg-subtle">{children}</p>
  )
}

/** The page ground, so anything raised in a story reads as raised. */
export function Stage({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 rounded-xl bg-background p-5 ring-1 ring-inset ring-edge">{children}</div>
}
