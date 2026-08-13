# AGENTS.md

## Package Contract

- This repository is the standalone source for `@figuredout/ui-web`.
- Keep components presentational: props in, callbacks out, no app data fetching.
- Preserve the public exports in `package.json` unless a breaking change is intentional and documented.
- Treat React, ReactDOM, `next-themes`, and Tailwind as consumer-provided peers.

## Read First

Before changing any component, read `docs/components.md` — it carries the surface ladder, the five rules the
components share, and the gotchas that have already cost someone an afternoon. `hybrid-mockup/` is the
standalone design reference the current system was built in: a static page per decision, not built or
imported by anything. Try a visual change there before it lands in `src/`.

## The Rules Components Must Not Break

1. **A hairline is an inset ring, never a border.** Rings do not change an element's size. On a container
   whose header or footer paints its own full-bleed surface, the ring must be an `::after` overlay — an
   inset ring is painted underneath children. See `Card`, `Section variant="card"`, `Dialog`, `Table framed`.
2. **Three elevation steps, no more.** `shadow-raised` rests, `shadow-hover` is picked up, `shadow-overlay`
   covers something else. Import `POPOVER_SURFACE` from `src/lib/overlay.js` rather than restating the
   floating surface in a new component.
3. **Mono uppercase captions name values; mono tabular figures are values.** Form labels are the exception —
   a label that instructs stays sentence-case semibold.
4. **One duration and one curve**: `duration-normal` with `ease-standard`, `duration-fast` under 200ms.
5. **One focus treatment**: a 4px `ring-focus-ring`.
6. **Which surface something sits on is its meaning.** `surface-sunken` is a hole, `surface` rests,
   `surface-raised` is lifted. Do not reach for a lighter surface to create emphasis.

## Working Style

- Prefer small, focused changes and existing component patterns.
- Keep design tokens centralized in `styles/tokens.css` and `tailwind-preset.ts`. A component must never
  hardcode a colour, a shadow or a duration.
- When adding a token, map it in `tailwind-preset.ts` in the same change, or consumers cannot reach it.
- New animations belong in the preset's `keyframes`/`animation`, not in a component's inline styles.
- Update `README.md`, `COMPONENT_GUIDE.md`, `docs/components.md` and `components.manifest.json` when public
  imports or component availability change — and add a story, or the component is invisible to the next agent.

## Validation

- `npm run build` after TypeScript or export changes.
- `npm run test` after component behavior changes.
- `npm run build-storybook` after story or docs changes — it is the only check that compiles the stories.
- `npm pack --dry-run` before publishing-related changes.
- After a token change, re-measure `docs/contrast-report.md`. Measure semantic text against its `-soft`
  companion composited over the surface, not against the surface: that is the composite a `Badge` produces,
  and it is where `--color-success` was failing AA.

## Things That Have Already Bitten Us

- **`tsc` does not check the stories.** `tsconfig.json` only includes `src/`, `index.ts` and the preset. A
  story can be broken while `npm run build` passes — run `build-storybook`.
- **A barrel can silently omit an export.** `ChartShell` was documented in the manifest for months while
  missing from `src/charts/index.ts`. If you add a component, export it from its barrel *and* the manifest.
- **A stretched grid row mis-centres absolutely positioned adornments.** Grid pushes slack into auto rows, so
  a field wrapper grows past its control and the caret drifts below it. Use `self-start` on the wrapper or
  `align-content: start` on the stack.
- **Container units need a container.** Anything sizing with `cqi` needs an ancestor declaring
  `container-type: inline-size` — otherwise the units resolve against the viewport and overflow.
- **Recharts animates regardless of `prefers-reduced-motion`,** and a line drawn by animation is invisible in
  a background tab, in print and to screenshot tooling. All four chart wrappers pass
  `isAnimationActive={false}`.
- **`--font-sans` needs its fallback chain.** It points at a `next/font` variable; without the fallback,
  anything rendering the package outside a Next app falls back to a serif.
