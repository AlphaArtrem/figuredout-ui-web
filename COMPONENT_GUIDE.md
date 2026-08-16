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

### The surface ladder

Light and dark both run four steps, and which one a thing sits on is its meaning, not a preference:

| Token | Use |
| --- | --- |
| `surface-sunken` | Holes: inputs, segmented-control tracks, wells. |
| `bg` | The page itself. |
| `surface` | Cards, tables, panels — anything resting on the page. |
| `surface-raised` | Anything lifted: an open tile, a hovered cell, a dialog, a menu, a toast. |

White is the top of that ladder in light mode, not the resting surface. A card that sits on `surface`
separates from the page without depending on its hairline, which is what makes `surface-raised` mean
something.

### The five rules

1. **A hairline is an inset ring, never a border.** Rings do not change an element's size, so nested
   containers stay aligned. On a container with a banded header or footer, use an overlay
   pseudo-element — an inset ring is painted *underneath* a child's full-bleed background (`Card`,
   `Section`, `Dialog` and `Table framed` all do this).
2. **Three elevation steps, no more.** `shadow-raised` rests, `shadow-hover` is picked up, and
   `shadow-overlay` is anything covering something else — dialog, side panel, menu, toast, popover,
   open tile. Import `POPOVER_SURFACE` rather than restating the floating surface.
3. **Mono uppercase captions name values; mono tabular figures are values.** Form labels are the
   exception — a label that instructs is sentence-case semibold.
4. **One duration and one curve**: `duration-normal` with `ease-standard`, or `duration-fast` under
   200ms. Nothing else.
5. **One focus treatment**: a 4px `ring-focus-ring`.

## Exports

Primitives:
`Badge`, `Button`, `IconButton`, `Card`, `CardHeader`, `CardBody`, `CardFooter`, `Checkbox`, `FormField`, `Input`, `Textarea`, `Select`, `Skeleton`, `Spinner`, `Switch`, `ThemeToggle`

Patterns:
`AppTopBar`, `Avatar`, `ConfirmDialog`, `DashboardShell`, `DescriptionList`, `Dialog`, `DropdownMenu`, `EmptyState`, `ExpandableTile`, `FilterBar`, `Hero`, `InfoBanner`, `PageBand`, `PageContent`, `PageHeader`, `Pagination`, `SearchInput`, `SeamGrid`, `SeamCell`, `seamCorners`, `SelectMenu`, `Section`, `SettingsSection`, `SidePanel`, `StatCard`, `StatCardContent`, `Stepper`, `Table`, `TableSection`, `Tabs`, `ToastProvider`, `Tooltip`, `useToast`

## Composition Notes

- Use `AppTopBar` for application chrome that must wrap cleanly at small widths while preserving accessible primary navigation.
- Use `DashboardShell` for operational apps that need persistent sidebar navigation, a sticky action/status bar, and a mobile navigation drawer.
- Use `StatCard` for compact metric tiles, not as a general content container.
- Use `Section variant="plain"` for page-level regions with a divider, icon, eyebrow, heading, and description.
- Use `InfoBanner` for semantic messages; warning and danger tones announce with `role="alert"`.
- Use `ExpandableTile` for optional detail blocks that can be controlled with `open` / `onOpenChange` or initialized with `defaultOpen`. Its open state is an overlay that stayed where it was, so do not stack more than a few in one view.
- Use `SeamGrid` for a set of related cells — stat tiles, rules, facts — so they read as one object rather than as separate cards. Pass a child count that divides evenly by every step (4 → 2 → 1); a hole in a grid of hairlines reads as a missing figure. `seamCorners` is exported for structures that cannot be a `SeamGrid`, such as `DescriptionList`'s `<dl>` and `Stepper`'s `<ol>`.
- Use `PageBand` for page-level regions: content stays inside `--measure`, the divider runs edge to edge.
- Use `Hero` only for marketing or landing surfaces, and only with a square-ish asset — its overlap and copy offset are derived from a 1:1 ratio.
- Use `StatCardContent` when a `StatCard` is a `SeamGrid` cell: the grid owns the surface, padding and corners.
- Use `SelectMenu` when options need descriptions, disabled states, or menu-style keyboard interaction beyond the native `Select`.
- Use `TableSection` for data regions; it renders `Table` in the plain table style by default to avoid nested card shells.
- Use `Table rowTone` to mark rows as `info`, `warning`, `danger`, or `success` without custom row styling.
- Use `Table framed` only when the table is the standalone focal component. Inside a `Card`, `Section` or `TableSection` the container already provides the frame, and two frames read as a box in a box.
- Use `SelectMenu`, not `Select`, when the option list has to match the theme: a native `<select>` popup is drawn by the OS and ignores the page's colours on several platforms.

Charts:
`BarChart`, `ChartShell`, `ChartTooltip`, `DonutChart`, `FunnelBars`, `LineChart`, `Sparkline`, `categoricalColor`, `sequentialColor`, `gridColor`, `axisLabelColor`

Every chart goes through `ChartShell`: it owns the loading, empty and view-as-table states, so no chart is ever the only way to read its own numbers. All four wrappers disable Recharts' entry animation — it ignores `prefers-reduced-motion`, and a line drawn by animation is invisible in a background tab, in print and to screenshot tooling.

Icons:
Approved Phosphor exports are available from `@figuredout/ui-web/icons`, including `Gear`, `List`, `Pause`, `Plus`, `WarningCircle`, and the shared `PhosphorIcon` / `PhosphorIconProps` types.

## Usage Rules

- Keep components reusable and presentational.
- Prefer extending this package over duplicating UI recipes in app code.
- Add tests for behavior changes, especially overlays, tabs, toasts, and keyboard behavior.
- Update `components.manifest.json` when adding or removing public exports.
