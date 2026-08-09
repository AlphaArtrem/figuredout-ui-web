# @figuredout/ui-web

Shared React UI foundations for FiguredOut web apps.

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
