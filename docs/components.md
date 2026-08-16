# UI Components

`@figuredout/ui-web` is the canonical UI surface for FiguredOut web apps. App code should compose these
components instead of reimplementing local button, form, overlay, table or header styling. When something is
missing, add it here rather than in app code.

Run `npm run storybook` for the live surface — every component has a story with a note on what it is for and
what changed. `hybrid-mockup/` is the standalone design reference the current system was built in.

## The surface ladder

Four steps, in both themes. **Which surface a thing sits on is its meaning, not a preference.**

| Token | What sits on it |
| --- | --- |
| `surface-sunken` | Holes: inputs, segmented-control tracks, wells |
| `bg` | The page itself |
| `surface` | Cards, tables, panels — anything resting on the page |
| `surface-raised` | Anything lifted: an open tile, a hovered cell, a dialog, a menu, a toast |

White is the top of that ladder in light mode, not the resting surface. A card on `surface` separates from
the page without leaning on its hairline, which is what leaves `surface-raised` free to mean lifted.

## The five rules

1. A hairline is an inset **ring**, never a border. On a container with a banded header or footer, use an
   overlay pseudo-element — an inset ring is painted underneath a child's full-bleed background.
2. Three elevation steps: `shadow-raised` rests, `shadow-hover` is picked up, `shadow-overlay` covers
   something else. Import `POPOVER_SURFACE` from `src/lib/overlay` rather than restating the floating surface.
3. Mono uppercase captions **name** values; mono tabular figures **are** values. A form label instructs
   rather than names, so it stays sentence-case semibold.
4. One duration and one curve: `duration-normal` with `ease-standard`, or `duration-fast` under 200ms.
5. One focus treatment: a 4px `ring-focus-ring`.

## Canonical

- **Tier 1 primitives**: `Button`, `IconButton`, `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`,
  `FormField`, `Badge`, `Card`, `Spinner`, `Skeleton`, `ThemeToggle`
- **Tier 2 composites**: `Table`, `Dialog`, `ConfirmDialog`, `SidePanel`, `Tabs`, `Tooltip`, `DropdownMenu`,
  `SelectMenu`, `ToastProvider` with `useToast`, `EmptyState`, `SearchInput`, `FilterBar`, `Pagination`,
  `ExpandableTile`
- **Tier 3 patterns**: `AppTopBar`, `DashboardShell`, `PageHeader`, `PageBand`, `Section`, `SettingsSection`,
  `SeamGrid` (+ `SeamCell`, `seamCorners`), `StatCard` (+ `StatCardContent`), `Stepper`, `DescriptionList`,
  `Avatar`, `InfoBanner`, `TableSection`, `Hero`
- **Charts**: `ChartShell`, `LineChart`, `BarChart`, `DonutChart`, `Sparkline`, `FunnelBars`, `ChartTooltip`,
  and the `categoricalColor` / `sequentialColor` / `gridColor` / `axisLabelColor` helpers

## Choosing a component

| If you are… | Use |
| --- | --- |
| showing a row of related figures | `SeamGrid` + `StatCardContent` |
| showing one figure | `StatCard` |
| showing records | `Table`, or `TableSection` when it needs a title and actions |
| framing a page region | `Section variant="plain"` inside a `PageBand` |
| framing a settings block | `Section variant="card"` / `SettingsSection` |
| titling a page | `PageHeader` |
| offering options with descriptions, or a list that must match the theme | `SelectMenu` |
| offering a plain list of values | `Select` |
| hiding optional detail | `ExpandableTile` |
| interrupting | `Dialog`, or `ConfirmDialog` for a yes/no |
| showing detail without leaving the page | `SidePanel` |
| reporting the result of an action | `useToast` |
| reporting the state of something on the page | `InfoBanner` |
| a marketing or landing surface | `Hero` |

## Rules

- Use only semantic token classes. No raw palette utilities, no hex literals, no black drop shadows, no
  `linear` or `ease-in-out`.
- Keep these components presentational: props in, callbacks out, no data fetching.
- Prefer extending this package over adding one-off UI recipes inside app code.
- Icons come from `@figuredout/ui-web/icons`, never from `@phosphor-icons/react` directly.

## Dashboard patterns

- `AppTopBar` owns app-level title, subtitle, primary navigation, sticky positioning and right-aligned
  actions. `DashboardShell` owns persistent sidebar navigation, the mobile drawer, sticky actions and status.
- `PageBand` owns page width (`--measure`) and the edge-to-edge divider between regions; `Section
  variant="plain"` owns the region's icon, eyebrow, heading and lede, stacked flush left at every width.
  `size="display"` gives it the
  page-level scale — reserve that for the two or three regions a page is navigated by.
- `SeamGrid` makes a set of related cells read as one object. Pass a child count that divides evenly by every
  step (4 → 2 → 1): a hole in a grid of hairlines reads as a missing figure. `seamCorners` is exported for
  structures that cannot be a `SeamGrid`, such as `DescriptionList`'s `<dl>` and `Stepper`'s `<ol>`.
- `Table framed` only when the table is the standalone focal component. Inside a `Card`, `Section` or
  `TableSection` the container already provides the frame. `Table rowTone` gives semantic row states: `info`,
  `warning`, `danger`, `success`.
- Every chart goes through `ChartShell`, so loading, empty and view-as-table behave the same everywhere and
  no chart is the only way to read its own numbers.

## Gotchas worth knowing before you edit

- **An inset ring hides behind a full-bleed child.** Any container whose header or footer paints its own
  surface needs the ring as an `::after` overlay. `Card`, `Section variant="card"`, `Dialog` and
  `Table framed` all do this; copy the pattern rather than reaching for a border.
- **A stretched grid row mis-centres absolute adornments.** A grid taller than its rows pushes the slack into
  auto rows, so a wrapper grows past its field and any absolutely centred caret or icon drifts. `Select` and
  `SearchInput` guard against it with `self-start`; stacks use `align-content: start`.
- **Container units need a container.** `StatCardContent` sizes its figure with `cqi`; a cell holding it must
  declare `container-type: inline-size` or the units fall back to the viewport and the figure overflows.
- **A native `<select>` popup belongs to the OS.** `color-scheme` and option colours are requests, and
  several platforms ignore them. Where the list must match the theme, use `SelectMenu`.
- **Semantic text is measured against its soft wash, not the surface.** See `docs/contrast-report.md`.
