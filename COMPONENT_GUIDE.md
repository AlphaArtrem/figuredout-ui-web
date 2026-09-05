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

Light is on both `:root` and `.light`, dark on `.dark`, so either scheme can be scoped to a subtree — a light preview panel inside a dark app needs `.light` on its wrapper, or it inherits `.dark` from `<html>` and renders dark.

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
`Badge`, `Button`, `IconButton`, `Card`, `CardHeader`, `CardBody`, `CardFooter`, `Checkbox`, `FormField`, `useFieldAria`, `Input`, `Textarea`, `Select`, `LoadingRegion`, `Skeleton`, `Spinner`, `Switch`, `ThemeToggle`

Patterns:
`AppTopBar`, `Avatar`, `ConfirmDialog`, `DashboardShell`, `DescriptionList`, `Dialog`, `DropdownMenu`, `EmptyState`, `ExpandableTile`, `FilterBar`, `Hero`, `InfoBanner`, `PageBand`, `PageContent`, `PageHeader`, `Pagination`, `SearchInput`, `SeamGrid`, `SeamCell`, `seamCorners`, `SelectMenu`, `Section`, `SettingsSection`, `SidePanel`, `StatCard`, `StatCardContent`, `Stepper`, `Table`, `TableSection`, `Tabs`, `ToastProvider`, `Tooltip`, `useToast`

## Composition Notes

- `ConfirmDialog`'s `onConfirm` may return a promise. Return nothing and it closes on confirm, as it always has. Return a promise and it holds the dialog open with a pending confirm button, refuses Escape/overlay/close while the write runs, closes on resolve, and on reject stays open with the error in a `role="alert"` line above the buttons. Pass `confirmErrorMessage` to map a rejection to a sentence.
- Pending state is one convention everywhere: a spinning glyph marked `aria-hidden`, `aria-busy` on the busy element, and a `role="status"` node with `sr-only` text mounted when the work starts. `Spinner` is those three parts standing alone; `Button loading` renders its status node *after* the children, so the accessible name gains a suffix ("Save Loading") instead of being replaced. Set `loadingLabel` to say something more specific.
- The same convention covers a *block* that is loading, not just a control: wrap it in `LoadingRegion`. `Skeleton` is `aria-hidden` and stays that way, so a page built out of skeletons is silent — nothing says content is coming and nothing says it arrived. `LoadingRegion` puts `aria-busy` on the block and a sibling `role="status"` span beside it, mounted empty and filled by an effect so the region exists before its text lands. Its text moves "" → `label` → `loadedLabel`, one write per transition, so a parent re-rendering four times re-announces nothing; announcing arrival is what makes a screen reader re-read the DOM the content just appeared in. Pass `failed` when the read errored or its retry is paused: a settled failure must neither claim to be loading nor claim to have loaded, and the error has its own `role="alert"`. A `LoadingRegion` nested inside another renders only its children, so a page that mounts several loading blocks announces once — give the outermost region the combined pending state.
- `FormField` names the controls inside it. `labelFor` is still the better association — it is what makes the label a click target for its control — but a field without one now publishes its label id and its hint/error ids through context, and `Input`, `Textarea` and `Select` name and describe themselves from it however deeply they are nested. A control that already carries its own `aria-label` or `aria-labelledby` keeps it. An `error` also publishes an `invalid` flag through the same context, so those three controls set their own `aria-invalid` — the parent never reaches into a child to place it — and the error itself is a `role="alert"`, announced when it appears. `required` rides the same channel: the asterisk beside the label is `aria-hidden` (it was being read as part of every field's name — "App name star") and the controls carry `aria-required` instead, so a field that marks itself required still says so on a control that was never passed `required`. Anything else inside a field — `Checkbox`, `Switch`, a custom picker, a row of buttons — does **not** inherit: give it `labelFor`, or a label of its own.
- Use `AppTopBar` for application chrome that must wrap cleanly at small widths while preserving accessible primary navigation.
- Use `DashboardShell` for operational apps that need persistent sidebar navigation, a sticky action/status bar, and a mobile navigation drawer.
- Use `StatCard` for compact metric tiles, not as a general content container.
- Use `Section variant="plain"` for page-level regions with a divider, icon, eyebrow, heading, and description. Both variants emit the eyebrow **before** the heading; the plain one used to emit it after, so the same design language read in two orders depending on the page. `Section` always renders an `h2` — a page that needs an `h1` wants `PageHeader`.
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
- **Always pass `Table label`.** It becomes an `sr-only` `<caption>` naming the table, and while the table is wider than its box the horizontal scroller becomes a `tabindex="0"` `role="region"` named from that caption — which is the only way a keyboard-only reader can reach a column that has scrolled off the right edge. The `tabindex` and the role appear **only** while it actually overflows, so a table that fits is not a tab stop. Give it the heading the table sits under, never the word "table".
- Table headers are sentence case, sortable or not. They used to be `uppercase` unless the column sorted — sortable headers are `<button>`s and Tailwind's preflight resets `text-transform` — so one header row ran two conventions and the difference encoded nothing.
- `PageHeader` puts `actions` **beside the title** on narrow screens and bottom-aligned beside the whole title-and-description block from `lg` up. It used to stack them under the description below `lg`, which left a page's primary action alone in the middle of a phone screen.
- `ThemeToggle` is a three-step cycle (system → light → dark), so its accessible name states the **action** ("Switch to light theme") rather than the current theme, and the new state is announced through a `role="status"` sibling instead of joining the name. `aria-pressed` is deliberately not used: it is a two-state affordance.
- Use `SelectMenu`, not `Select`, when the option list has to match the theme: a native `<select>` popup is drawn by the OS and ignores the page's colours on several platforms.

Charts:
`BarChart`, `ChartShell`, `ChartTooltip`, `DonutChart`, `FunnelBars`, `LineChart`, `Sparkline`, `categoricalColor`, `sequentialColor`, `gridColor`, `axisLabelColor`

`Sparkline` needs two points to be a line. Below that it renders the `notEnoughDataLabel` text instead of a chart — recharts falls back to drawing the lone point when a series has no line, and a single pale dot in an empty box reads as a rendering fault. That text is *not* `aria-hidden`, unlike the chart, because it is the only thing saying why the trend is missing.

`FunnelBars` takes a `label`. Its default names a lead pipeline, because that is what it was built for; anything else it breaks down — a trial funnel, a list of disqualification reasons — must pass its own, or its readers are told they are somewhere they are not.

Every chart goes through `ChartShell`: it owns the loading, empty and view-as-table states, so no chart is ever the only way to read its own numbers. All four wrappers disable Recharts' entry animation — it ignores `prefers-reduced-motion`, and a line drawn by animation is invisible in a background tab, in print and to screenshot tooling.

Icons:
Approved Phosphor exports are available from `@figuredout/ui-web/icons`, including `Gear`, `List`, `Pause`, `Plus`, `WarningCircle`, and the shared `PhosphorIcon` / `PhosphorIconProps` types.

## Usage Rules

- Keep components reusable and presentational.
- Prefer extending this package over duplicating UI recipes in app code.
- Add tests for behavior changes, especially overlays, tabs, toasts, and keyboard behavior.
- Update `components.manifest.json` when adding or removing public exports.
