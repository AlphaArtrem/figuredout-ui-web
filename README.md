# @playtohire/ui

Shared UI foundations for the PlayToHire redesign.

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
