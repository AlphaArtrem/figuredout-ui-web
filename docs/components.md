# UI Components

`@figuredout/ui-web` is the canonical UI surface for FiguredOut web apps. App code
should compose these components instead of reimplementing local button, form, overlay,
table, or header styling.

## Canonical

- Tier 1 primitives: `Button`, `IconButton`, `Input`, `Textarea`, `Select`, `Checkbox`,
  `Switch`, `FormField`, `Badge`, `Card`, `Spinner`, `Skeleton`, `ThemeToggle`
- Tier 2 composites: `Table`, `Dialog`, `ConfirmDialog`, `SidePanel`, `Tabs`, `Tooltip`,
  `DropdownMenu`, `SelectMenu`, `ToastProvider` with `useToast`, `EmptyState`,
  `SearchInput`, `FilterBar`, `Pagination`, `ExpandableTile`
- Tier 3 patterns: `AppTopBar`, `PageHeader`, `Section`, `SettingsSection`, `StatCard`,
  `Stepper`, `DescriptionList`, `Avatar`, `InfoBanner`, `TableSection`

## Experimental

- `src/charts`
  Charts stay experimental until Phase 4 lands the shared chart wrappers and palette
  validation workflow.

## Rules

- Use only semantic token classes from `@figuredout/ui-web` foundations.
- Keep these components presentational: props in, callbacks out, no data fetching.
- Prefer extending this package over adding one-off UI recipes inside app code.
- Prefer plain divided sections and plain tables for dense operational dashboards; reserve cards for metrics, repeated tiles, modals, and focused callouts.
