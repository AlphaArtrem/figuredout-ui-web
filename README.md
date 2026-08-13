# @figuredout/ui-web

Shared React UI foundations for FiguredOut web apps.

## The design system

Light and dark both run a four-step surface ladder — `surface-sunken` < `bg` < `surface` <
`surface-raised` — and white is the top of it in light mode, not the resting surface. That is what makes
elevation mean something: a card on `surface` separates from the page without leaning on its hairline,
so `surface-raised` is free to mean *lifted* (an open tile, a hovered cell, a dialog, a menu, a toast).

Five rules hold the components together, and `COMPONENT_GUIDE.md` states them in full: a hairline is an
inset ring, never a border; three elevation steps and no more; mono uppercase captions name values while
mono tabular figures are values; one duration and one curve; one focus ring.

`hybrid-mockup/` is the standalone reference this system was designed in — a static preview of every
component with a note on each decision. It is not built, imported or published; treat it as the spec and
as the place to try a change before it lands in `src/`.

## Install

```bash
npm install @figuredout/ui-web
```

Import the token stylesheet once in the app shell:

```tsx
import "@figuredout/ui-web/styles/tokens.css"
```

Use the Tailwind preset from the consuming app config:

```ts
import uiPreset from "@figuredout/ui-web/tailwind-preset"

export default {
  presets: [uiPreset],
  content: ["./src/**/*.{ts,tsx}", "./node_modules/@figuredout/ui-web/dist/**/*.{js,mjs}"],
}
```

## Public imports

- `@figuredout/ui-web` exports primitives and layout/application patterns.
- `@figuredout/ui-web/icons` exports the approved Phosphor icon surface.
- `@figuredout/ui-web/charts` exports chart wrappers and color helpers.
- `@figuredout/ui-web/styles/tokens.css` provides CSS custom properties.
- `@figuredout/ui-web/tailwind-preset` maps tokens to semantic Tailwind utilities.

## Component surface

Primitives:
`Badge`, `Button`, `IconButton`, `Card`, `CardHeader`, `CardBody`, `CardFooter`, `Checkbox`, `FormField`, `Input`, `Textarea`, `Select`, `Skeleton`, `Spinner`, `Switch`, `ThemeToggle`

New in this system: `Hero`, `PageBand`, `SeamGrid` / `SeamCell` / `seamCorners`, `StatCardContent`.

Application patterns:
`AppTopBar`, `Avatar`, `ConfirmDialog`, `DashboardShell`, `DescriptionList`, `Dialog`, `DropdownMenu`, `EmptyState`, `ExpandableTile`, `FilterBar`, `Hero`, `InfoBanner`, `PageBand`, `PageContent`, `PageHeader`, `Pagination`, `SearchInput`, `SeamGrid`, `SelectMenu`, `Section`, `SettingsSection`, `SidePanel`, `StatCard`, `StatCardContent`, `Stepper`, `Table`, `TableSection`, `Tabs`, `ToastProvider`, `Tooltip`, `useToast`

Dashboard composition:

- Use `AppTopBar` for responsive app navigation with primary nav links and right-aligned actions.
- Use `Section variant="plain"` for page-level dashboard regions that should not create nested card shells.
- Use `TableSection` for titled data regions; the section is the container, so the table inside it is never framed.
- Use `Table rowTone` for semantic row status, and `Table framed` only when the table is the standalone focal component — inside a `Card` or `Section` the container already provides the frame.
- Use `SelectMenu` for richer single-select controls — and whenever the option list has to match the theme, since a native `<select>` popup is drawn by the OS. Use `ExpandableTile` for compact disclosure panels and `InfoBanner` for status or guidance messages.
- Use `SeamGrid` for a set of related cells so they read as one object; pass a child count that divides evenly by 4, 2 and 1.

## Component Explorer

This repo includes a Storybook preview explorer for viewing and interacting with the React components.

```bash
npm run storybook
```

Storybook runs at `http://localhost:6006` by default. Use it to inspect primitives,
patterns, charts, and icons before changing or publishing the package.

To verify the explorer can be built as a static artifact:

```bash
npm run build-storybook
```

## Visual direction

- Soft Structuralism: warm neutrals, one desaturated teal accent, tinted shadows.
- Geist is the default typeface, with Geist Mono for tabular numerals and dense metrics.
- Motion uses `--ease-standard` and the `--motion-fast` / `--motion-normal` tokens.
- Feature code consumes semantic roles such as `bg-surface`, `text-fg-muted`, and `shadow-raised`.

## Token catalog

- Surfaces: `--color-bg`, `--color-surface`, `--color-surface-raised`, `--color-surface-sunken`
- Ink: `--color-fg`, `--color-fg-muted`, `--color-fg-subtle`
- Structure: `--color-edge`, `--color-edge-strong`
- Brand and focus: `--color-primary`, `--color-primary-hover`, `--color-primary-fg`, `--color-primary-soft`, `--color-focus-ring`
- Status: `--color-success`, `--color-warning`, `--color-danger`, `--color-info` plus `-soft` companions
- Data viz: `--chart-cat-1` through `--chart-cat-6`, `--chart-seq`, `--chart-grid`, `--chart-axis-label`
- Typography: `--font-sans`, `--font-mono`, `--text-xs` through `--text-4xl`, `--leading-xs` through `--leading-4xl`
- Layout and motion: spacing, radius, shadow, duration, easing, and z-index tokens in `styles/tokens.css`

## Rules

- Raw palette utilities such as `gray-*`, `slate-*`, `zinc-*`, `stone-*`, `indigo-*`, and `violet-*` are banned in migrated feature code.
- Hex colors do not belong in feature code.
- Do not introduce a second accent color.
- Do not use black drop shadows, `linear`, or `ease-in-out`.
- Status colors stay reserved for semantic feedback and are not reused as chart series.
