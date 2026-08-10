# Component Guide

`@figuredout/ui-web` provides reusable React UI primitives, application patterns, chart wrappers, icon exports, CSS tokens, and a Tailwind preset.

## Import Paths

```tsx
import { AppTopBar, Button, Card, PageHeader, ToastProvider } from "@figuredout/ui-web"
import { BarChart, categoricalColor } from "@figuredout/ui-web/charts"
import { Gear } from "@figuredout/ui-web/icons"
import "@figuredout/ui-web/styles/tokens.css"
```

```ts
import uiPreset from "@figuredout/ui-web/tailwind-preset"
```

## Tokens

- Import `@figuredout/ui-web/styles/tokens.css` once at the app root.
- Use semantic Tailwind classes such as `bg-surface`, `text-fg-muted`, `border-edge`, and `shadow-raised`.
- Do not use raw palette utilities, hardcoded hex colors, black drop shadows, `linear`, or `ease-in-out` in consuming UI code.

## Exports

Primitives:
`Badge`, `Button`, `IconButton`, `Card`, `CardHeader`, `CardBody`, `CardFooter`, `Checkbox`, `FormField`, `Input`, `Textarea`, `Select`, `Skeleton`, `Spinner`, `Switch`, `ThemeToggle`

Patterns:
`AppTopBar`, `Avatar`, `ConfirmDialog`, `DashboardShell`, `DescriptionList`, `Dialog`, `DropdownMenu`, `EmptyState`, `ExpandableTile`, `FilterBar`, `InfoBanner`, `PageContent`, `PageHeader`, `Pagination`, `SearchInput`, `SelectMenu`, `Section`, `SettingsSection`, `SidePanel`, `StatCard`, `Stepper`, `Table`, `TableSection`, `Tabs`, `ToastProvider`, `Tooltip`, `useToast`

## Composition Notes

- Use `AppTopBar` for application chrome that must wrap cleanly at small widths while preserving accessible primary navigation.
- Use `DashboardShell` for operational apps that need persistent sidebar navigation, a sticky action/status bar, and a mobile navigation drawer.
- Use `StatCard` for compact metric tiles, not as a general content container.
- Use `Section variant="plain"` for page-level regions with a divider, icon rail, eyebrow, heading, and description.
- Use `InfoBanner` for semantic messages; warning and danger tones announce with `role="alert"`.
- Use `ExpandableTile` for optional detail blocks that can be controlled with `open` / `onOpenChange` or initialized with `defaultOpen`.
- Use `SelectMenu` when options need descriptions, disabled states, or menu-style keyboard interaction beyond the native `Select`.
- Use `TableSection` for data regions; it renders `Table` in the plain table style by default to avoid nested card shells.
- Use `Table rowTone` to mark rows as `info`, `warning`, `danger`, or `success` without custom row styling.
- Use `Table variant="framed"` only when the table is the standalone focal component and needs its own surface.

Charts:
`BarChart`, `ChartShell`, `ChartTooltip`, `DonutChart`, `FunnelBars`, `LineChart`, `Sparkline`, `categoricalColor`, `sequentialColor`, `gridColor`, `axisLabelColor`

Icons:
Approved Phosphor exports are available from `@figuredout/ui-web/icons`, including `Gear`, `List`, `Pause`, `Plus`, `WarningCircle`, and the shared `PhosphorIcon` / `PhosphorIconProps` types.

## Usage Rules

- Keep components reusable and presentational.
- Prefer extending this package over duplicating UI recipes in app code.
- Add tests for behavior changes, especially overlays, tabs, toasts, and keyboard behavior.
- Update `components.manifest.json` when adding or removing public exports.
