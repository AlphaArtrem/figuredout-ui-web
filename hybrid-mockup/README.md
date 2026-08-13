# Hybrid design system mockup

A throwaway preview of what `@figuredout/ui-web` would look like with five mechanics borrowed from the
callpool site (`~/Desktop/workspace/callpool/site`). **It changes nothing in this package** — no file in
`src/`, `styles/`, `stories/` or `.storybook/` was touched, nothing imports this folder, and deleting the
folder leaves the package exactly as it was.

## Run it

```bash
cd hybrid-mockup && python3 -m http.server 4321
```

Two pages:

- <http://localhost:4321/> — the five borrowed mechanics, each beside what the package renders today
- <http://localhost:4321/gallery.html> — **the component gallery**: all 46 exports in the hybrid system,
  for side-by-side comparison with Storybook

A server is needed rather than opening the files directly: the hero's width simulator loads
`hero-frame.html` in an iframe, which `file://` blocks.

Compare against the current system in the other window:

```bash
npm run storybook
```

## What's in it

| Mechanic | Source | What was adapted |
| --- | --- | --- |
| Hero with overlapping figures card | callpool | Straight lift — the package has no hero. Art and card in one column, words in the other; under 880px they share a cell, the art hangs from the top at a capped width and the copy drops below the raised arm. |
| Section heads | merged | `Section variant="plain"`'s icon rail and mono eyebrow, at callpool's display scale (fluid h2 up to 3.25rem, a real lede). |
| Connected cards | merged | callpool's seam grid — a 1px gap over a seam-coloured ground instead of per-card borders. Corner cells carry the radius per breakpoint, and the hover is a surface change rather than a lift. |
| Expandable tiles | merged | figuredout's `ExpandableTile`, with an open state that borrows `--shadow-overlay` (the Dialog elevation) so an open tile reads as a popped card. |
| Faded hue dots | callpool | 20 radial gradients on the body, from four decorative `--glow-*` tokens kept separate from the semantic palette. |
| Light theme, rebuilt | merged | A real elevation ladder — `sunken < page < surface < raised`, with white reserved for raised — in three hues. Sage borrows callpool's green-biased neutrals. |

Controls in the top bar: **light palette**, **theme**, **display face** (product sans vs callpool's
condensed caps), and **hue dot density** — many (20 circles) / some (12) / few (6, edges only) / off. The
levels compose subsets of the same twenty dots, so the dots never move between settings; there are simply
fewer of them. Light mode runs them at roughly double the opacity of dark, because at dark's percentages a
circle over a tinted near-white ground is invisible.

## The light theme

The package's light theme is `#fafafa` page, `#ffffff` surface, `#ffffff` raised — a 2% step, then none at
all. Cards depend entirely on their hairline to exist, and "raised" cannot be expressed, which is why the
popped-tile and seam-hover mechanics only read in dark mode. Dark has three real steps
(`#111113 → #18191b → #212225`).

`light-themes.css` holds four palettes, each a plain class so it can go on `<html>` or on a single swatch
box. Pick one in the top bar, or hit **Apply** on a card in the "White is the top of the ladder" section:

- **`lt-sage`** — green-biased neutrals, the recommendation. Closest to today's greys, agrees with the brand
  green, and is how callpool's own light theme is built.
- **`lt-paper`** — warm greige. The editorial option; easiest on a long page of dense figures.
- **`lt-slate`** — cool blue-grey. The conventional analytics look.
- **`lt-current`** — what ships today, for comparison.

Each also re-tints the three shadow tokens with its own neutral instead of black, and carries its own hue
dot intensity. Contrast against each
palette's own surface: `fg-muted` above 9:1, `fg-subtle` above 6.5:1 — both AA with headroom, though lower
than today's 11.4:1 / 8.6:1 against pure white. That is the trade being proposed.

## The gallery

`gallery.html` shows every export — primitives, patterns, charts, icons, and the foundations under them —
in the hybrid system, including the components that did not change, so a Storybook comparison can confirm
nothing drifted. Each entry carries its Storybook path and one line on what moved and why. Dialogs, side
panels, menus, tabs, toasts, pagination and the chart's view-as-table toggle are all live on the page.

The seven changes that are more than a re-skin:

| Component | Change |
| --- | --- |
| Input / Textarea / Select | Fields sit on `surface-sunken` — a field is a hole you type into, and a white input on a white card had only its border. |
| Card | Drops the padded shell (a card inside a card): header on raised, body on surface, one hairline. Tone moves from a ring to a leading bar. |
| Table | One table, not `framed` + `plain` — the frame belongs to whatever holds the table. Row-tone wash lightened. |
| Tabs | Track is sunken, active tab raised out of it (the package had it the other way round). |
| Pagination | Page numbers in the same sunken track as Tabs, so the two idioms match. |
| EmptyState | No dashed border — a dashed rectangle means "drop here", which is a different component. |
| Skeleton | Sweep instead of pulse. |

Plus the three from the mechanics page: ExpandableTile's popped open state, Section's display scale, and
StatCard/DescriptionList/Stepper rendering as seam grids when they appear as a set.

**Dropdowns**: every dropdown on the gallery — the two in its own top bar, FilterBar's, the dialog's — is
`SelectMenu`, the themed listbox. A native `<select>` popup is drawn by the OS and stays light on a dark
page whatever CSS asks for, so the only native one left is the `Select` primitive's own demo, which says so.

**Note on caching**: `python3 -m http.server` sends no cache headers, so a plain reload can serve a stale
stylesheet after an edit. Hard-refresh (`⌘⇧R`) if something looks half-applied.

## Files

- `index.html` — the mockup page, with each mechanic beside what the package renders today
- `gallery.html` + `gallery.css` — the full component gallery
- `hero-frame.html` — the hero alone, so the width simulator can put a real 375/768/1100 viewport around it
- `tokens-hybrid.css` — `styles/tokens.css` copied verbatim, plus seven additive tokens. Two deliberate
  differences from the package are marked `CHANGED`: theme switching also answers to `[data-theme]`, and the
  font variables fall back to system faces (there is no `next/font` here)
- `hybrid.css` — the component layer. Every block is tagged `[CP]` / `[FO]` / `[MIX]` for where the idea came from
- `light-themes.css` — the four light palettes and the swatch furniture
- `hero-art.png` — callpool's mascot, copied unchanged. A placeholder: the hero's `-25%` overlap and `64%` copy
  offset are derived from its 890×900 shape, so a 1:1 replacement keeps them valid and a different aspect ratio
  means recomputing both

## Open questions for the real package

1. **The display face.** Condensed caps is what makes callpool look like callpool, but it needs a real webfont —
   `font-stretch: condensed` against a system fallback resolves differently on every machine.
2. **Which light palette.** Sage, paper or slate — the only one of these changes that re-values existing tokens, so it
   wants its own commit and one pass of visual review across every light-mode story.
3. **Page-level layout tokens.** `--measure` and `--gut` have no home today; `DashboardShell` hardcodes its own.
