# UI Components

`@playtohire/ui` is the canonical UI surface for the redesign. App code in `apps/web`
should compose these components instead of reimplementing local button, form, overlay,
table, or header styling.

## Canonical

- Tier 1 primitives: `Button`, `IconButton`, `Input`, `Textarea`, `Select`, `Checkbox`,
  `Switch`, `FormField`, `Badge`, `Card`, `Spinner`, `Skeleton`, `ThemeToggle`
- Tier 2 composites: `Table`, `Dialog`, `ConfirmDialog`, `SidePanel`, `Tabs`, `Tooltip`,
  `DropdownMenu`, `ToastProvider` with `useToast`, `EmptyState`, `SearchInput`,
  `FilterBar`, `Pagination`
- Tier 3 patterns: `PageHeader`, `Section`, `SettingsSection`, `StatCard`, `Stepper`,
  `DescriptionList`, `Avatar`

## Experimental

- `packages/ui/src/charts`
  Charts stay experimental until Phase 4 lands the shared chart wrappers and palette
  validation workflow.

## Rules

- Use only semantic token classes from `@playtohire/ui` foundations.
- Keep these components presentational: props in, callbacks out, no data fetching.
- Prefer extending this package over adding one-off UI recipes inside `apps/web`.
