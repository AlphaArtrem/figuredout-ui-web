# State

Edit in place. No per-session sections. Last reviewed 2026-09-23 from the repository (git history,
`package.json`, source tree); nothing here was re-run.

## What exists

- `@figuredout/ui-web` version `0.2.1` (`package.json`, `components.manifest.json`). React UI primitives,
  patterns, chart wrappers, a Phosphor icon surface, CSS tokens (`styles/tokens.css`) and a Tailwind preset
  (`tailwind-preset.ts`, shipped as ESM and CJS). The component list lives in `README.md` — not repeated here.
- Consumed from GitHub as a git dependency: `dist/` is gitignored and the `prepare` script builds on install
  (commit `e8cefeb`). Commit message records that older `0.0.1` tarballs are vendored in several consuming repos.
- Tests: 49 `*.test.tsx` files under `src/` plus `tailwind-preset.test.ts` (Vitest + Testing Library, jsdom).
- Storybook 10 explorer in `stories/` and `.storybook/`; `hybrid-mockup/` is a static, unbuilt design reference.
- No CI configuration in the repository (no `.github/`). All validation in `AGENTS.md` is run by hand.
- A `chat` group in the main entry (`src/chat/`): `ChatPane`, `ChatHeader`, `MessageList`, `MessageBubble`,
  `SystemEvent`, `DayDivider`, `TypingIndicator`, `Composer`.
- Latest release (2026-09-23): `0.2.1`, a patch with no export change. `IconButton` was drawing every glyph at
  12px: its `px-0` lost the cascade to `Button`'s `px-3`/`px-4` (`docs/components.md`, gotchas). `Button` now
  takes `iconOnly`, which swaps its size classes for a padding-free square (36px `sm`, 44px `md`); `IconButton`
  and `NumberField`'s steppers use it, and `Composer` dropped its `!px-0` workaround. An icon-only button that
  is loading shows the spinner in place of its glyph rather than beside it. **Visual change for consumers:**
  every icon button's glyph grows to the size its caller gave it — in this package 14px (`Pagination`, toast
  dismiss), 16px (`Dialog`/`SidePanel` close, `Composer` send, `NumberField`) and 18px (`DashboardShell` menu,
  `DropdownMenu` trigger) — from 12px; app-side icon buttons grow the same way. Button sizes are unchanged.
- Previous release (2026-09-23): `0.2.0`, a minor bump for additive exports only (invariant 7). It merges two
  branches:
  - `ds/dataviz` — the data-visualisation set: `ProgressRing`, `Gauge`, `StepSegments`, `StackedBar`,
    `WeightedSegments`, `RankedBars`, `Heatmap`, `Legend` in `/charts`, `ScoreChip` in the main entry,
    `LineChart area`/`highlightIndex`, `StatCard aside`, and the `--chart-track` token. `FunnelBars` now renders
    through `RankedBars`.
  - `ds/chat-nav` — the chat group; `SegmentedControl`, `CommandPalette` + `useCommandPaletteShortcut`,
    `BottomNav`, `Popover`, `NotificationList` and the `Kbd` primitive; icons `ArrowDown`, `Bell`, `Checks`,
    `Lightning`, `Paperclip`, `Smiley`; token `--color-chat-assistant`; preset animation `typing-dot`. `Dialog`'s
    focus hook moved to `src/lib/use-dialog-focus.ts` so `CommandPalette` shares it.
- Previous change (2026-09-16): WhatsApp/Instagram/Messenger logo exports added then removed the same day; the
  version was not bumped.

## Settled decisions (and why)

- Presentational only: props in, callbacks out, no data fetching (`AGENTS.md` package contract).
- React, ReactDOM, `next-themes` and Tailwind are consumer-provided peers.
- Four-step surface ladder and the shared component rules — see `docs/components.md`.
- Chart forms follow the data, not taste: a ring is only ever one value toward a limit or goal; a split of one
  whole is a `StackedBar`; a comparison is `RankedBars`; a trend is a sparkline or line/area chart; a score in a
  list is a `ScoreChip`; "n of total" is `StepSegments` (the product's dashboard redesign, 2026-09-23).
- Build on install rather than vendoring tarballs, so a git install is usable and cannot go stale (`e8cefeb`).
- A `Popover` primitive rather than hosting notifications in `DropdownMenu`: the menu only takes command items
  (`role="menuitem"` buttons), and a notification list is a titled region with links, a header action and a
  footer. The popover is non-modal and reuses `POPOVER_SURFACE` and `useViewportClamp` (2026-09-23).
- Chat components live in their own `src/chat/` group but ship from the main entry, like primitives and
  patterns; only charts and icons have their own subpaths (2026-09-23).

## Invariants

Each names what breaks silently if violated, and what enforces it today.

1. **Every component is exported from its barrel and listed in `components.manifest.json`.** Breaks: a
   documented component is unimportable (happened with `ChartShell`). Enforced by: nothing automated.
2. **`prepare` must succeed on a clean clone.** Breaks: every consumer's install fails or ships no `dist/`.
   Enforced by: nothing automated; `npm run build` by hand.
3. **Stories compile.** `tsc` does not include `stories/`. Breaks: Storybook while the build passes.
   Enforced by: `npm run build-storybook` by hand.
4. **Every token is mapped in `tailwind-preset.ts`.** Breaks: consumers cannot reach the token.
   Enforced by: nothing; `tailwind-preset.test.ts` only covers opacity-modified colours.
5. **Components never hardcode a colour, shadow or duration.** Breaks: theming and dark mode.
   Enforced by: review only.
6. **`docs/contrast-report.md` matches `styles/tokens.css`.** Breaks: an AA failure ships unnoticed.
   Enforced by: nothing; the measuring script is kept in the report, not the repo.
7. **Public exports change only with a version bump.** Breaks: an installed artifact is indistinguishable
   from the one it replaced. Enforced by: nothing.

## Next action

None recorded in the repository. Ask the maintainer; see `plan.md` for open questions.
