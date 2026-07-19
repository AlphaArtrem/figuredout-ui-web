import type { ReactNode } from "react"

export interface DescriptionListItem {
  label: ReactNode
  value: ReactNode
}

export interface DescriptionListProps {
  items: DescriptionListItem[]
}

export function DescriptionList({ items }: DescriptionListProps) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={String(item.label)} className="rounded-lg bg-surface-raised px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-[0.12em] text-fg-subtle">{item.label}</dt>
          <dd className="mt-2 text-sm text-fg">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
