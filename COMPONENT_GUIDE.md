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
`Badge`, `Button`, `IconButton`, `Card`, `CardHeader`, `CardBody`, `CardFooter`, `Checkbox`, `FormField`, `useFieldAria`, `useFieldLabelId`, `Input`, `Textarea`, `Select`, `Kbd`, `LoadingRegion`, `NumberField`, `ScoreChip`, `scoreTone`, `Skeleton`, `Spinner`, `Switch`, `ThemeToggle`

Patterns:
`AppTopBar`, `Avatar`, `BottomNav`, `CommandPalette`, `useCommandPaletteShortcut`, `ConfirmDialog`, `DashboardShell`, `DescriptionList`, `Dialog`, `DropdownMenu`, `EmptyState`, `ExpandableTile`, `FilterBar`, `Hero`, `InfoBanner`, `NotificationList`, `PageBand`, `PageContent`, `PageHeader`, `Pagination`, `Popover`, `SearchInput`, `SeamGrid`, `SeamCell`, `seamCorners`, `SegmentedControl`, `SelectMenu`, `Section`, `SettingsSection`, `SidePanel`, `StatCard`, `StatCardContent`, `Stepper`, `Table`, `TableSection`, `Tabs`, `TagPicker`, `ToastProvider`, `Tooltip`, `useToast`

Chat:
`ChatPane`, `ChatHeader`, `MessageList` (+ `MessageListHandle`), `MessageBubble`, `SystemEvent`, `DayDivider`, `TypingIndicator`, `Composer`

## Composition Notes

- `ConfirmDialog`'s `onConfirm` may return a promise. Return nothing and it closes on confirm, as it always has. Return a promise and it holds the dialog open with a pending confirm button, refuses Escape/overlay/close while the write runs, closes on resolve, and on reject stays open with the error in a `role="alert"` line above the buttons. Pass `confirmErrorMessage` to map a rejection to a sentence.
- Pending state is one convention everywhere: a spinning glyph marked `aria-hidden`, `aria-busy` on the busy element, and a `role="status"` node with `sr-only` text mounted when the work starts. `Spinner` is those three parts standing alone; `Button loading` renders its status node *after* the children, so the accessible name gains a suffix ("Save Loading") instead of being replaced. Set `loadingLabel` to say something more specific.
- The same convention covers a *block* that is loading, not just a control: wrap it in `LoadingRegion`. `Skeleton` is `aria-hidden` and stays that way, so a page built out of skeletons is silent — nothing says content is coming and nothing says it arrived. `LoadingRegion` puts `aria-busy` on the block and a sibling `role="status"` span beside it, mounted empty and filled by an effect so the region exists before its text lands. Its text moves "" → `label` → `loadedLabel`, one write per transition, so a parent re-rendering four times re-announces nothing; announcing arrival is what makes a screen reader re-read the DOM the content just appeared in. Pass `failed` when the read errored or its retry is paused: a settled failure must neither claim to be loading nor claim to have loaded, and the error has its own `role="alert"`. A `LoadingRegion` nested inside another renders only its children, so a page that mounts several loading blocks announces once — give the outermost region the combined pending state.
- `FormField` names the controls inside it. `labelFor` is still the better association — it is what makes the label a click target for its control — but a field without one now publishes its label id and its hint/error ids through context, and `Input`, `Textarea` and `Select` name and describe themselves from it however deeply they are nested. A control that already carries its own `aria-label` or `aria-labelledby` keeps it. An `error` also publishes an `invalid` flag through the same context, so those three controls set their own `aria-invalid` — the parent never reaches into a child to place it — and the error itself is a `role="alert"`, announced when it appears. `required` rides the same channel: the asterisk beside the label is `aria-hidden` (it was being read as part of every field's name — "App name star") and the controls carry `aria-required` instead, so a field that marks itself required still says so on a control that was never passed `required`. Anything else inside a field — `Checkbox`, `Switch`, a custom picker, a row of buttons — does **not** inherit: give it `labelFor`, or a label of its own.
- Use `NumberField` for a bounded integer: a text input with `inputmode="numeric"` and the spin-button role between Decrease and Increase buttons, each 44 × 44 and disabled at its bound. It is controlled (`value`, `onValueChange`), clamps what is typed to `min`/`max`, keeps a half-typed draft until it parses rather than snapping to a bound, and steps with the arrow keys, Home and End. Inside a `FormField` the input takes the field's name, required and invalid state like any `Input`; the buttons do **not** take the field's name — they announce as "Decrease *field label*" by pointing `aria-labelledby` at their own verb and at the label (`useFieldLabelId`). Pass `label` when there is no field around it. `decreaseLabel`/`increaseLabel` word the verbs.
- `useFieldLabelId()` returns the enclosing `FormField`'s label id whether or not `labelFor` is set. It is for a composite control whose parts need names built *from* the field's words; handing a part the field's name itself renames every part after the field.
- `IconButton` is a padding-free square — 36px at `size="sm"`, 44px at `md` — and draws its glyph at the size you give it: 14–16px at `sm`, 16–18px at `md`. For an icon-only button that needs other children (an `sr-only` label, as `NumberField`'s steppers have), use `Button iconOnly`. Do not pass `px-0` to make a square: `cn` does not let a call-site class beat `Button`'s own padding. While loading, the spinner replaces the glyph.
- `Button variant="warning"` is for an action that is consequential but not destructive — borrowing someone's seat, publishing, overriding. The warning wash, warning ink and a warning ring; its contrast is in `docs/contrast-report.md`. Red stays `danger`'s, for what cannot be undone.
- Use `AppTopBar` for application chrome that must wrap cleanly at small widths while preserving accessible primary navigation.
- Use `DashboardShell` for operational apps that need persistent sidebar navigation, a sticky action/status bar, and a mobile navigation drawer.
- Use `StatCard` for compact metric tiles, not as a general content container. Its `value` renders in a `div`, so `value={<Skeleton className="h-9 w-20" />}` is valid while the figure loads; it used to be a `p`, which cannot hold a block. `aside` puts a small visual beside the figure — a `Sparkline`, `StepSegments` or a small `ProgressRing` — in up to two fifths of the tile; the figure's size steps down so it never wraps. Without `aside` the markup is exactly what it was. What the aside draws must also be in the text.
- Use `ScoreChip` for a score in a table column or a list row. `thresholds` sets the tone (default success from 75, warning from 60, danger below — `scoreTone()` applies the same rule elsewhere); `null`/`NaN` is a neutral dash announced as `missingLabel` ("No score"), never a zero. Its wash, ink and ring are `Badge`'s.
- Use `Section variant="plain"` for page-level regions with a divider, icon, eyebrow, heading, and description. Both variants emit the eyebrow **before** the heading; the plain one used to emit it after, so the same design language read in two orders depending on the page. `Section` renders an `h2` by default; `headingLevel` changes the tag and never the type. Pass `headingLevel={1}` only when a display-size plain `Section` is the page's own header (a marketing page that `PageHeader`'s dashboard scale would shrink) — otherwise a page that needs an `h1` wants `PageHeader`.
- `Card` renders its `title` in a `div` by default, because a card is not a heading. `titleAs="h3"` (or `h2`–`h6`) makes a card heading-navigable without changing its look; a block that is a region of the page is still a `Section`.
- Use `InfoBanner` for semantic messages; warning and danger tones announce with `role="alert"`. Hand `actions` the controls themselves — a fragment of buttons is fine. From `sm` they sit beside the text; below `sm` they move under it, in a wrapping row aligned with the text, so a phone keeps the sentence at full width instead of wrapping it into a narrow column. Do not stack them yourself.
- `SidePanel size` is `md` (576 px) by default and `lg` (672 px). `xl` widens to 896 px from `lg` and `2xl` to 1152 px from `xl`; below their breakpoints both stay at 672 px, and every size is full width on a phone. Use the wide sizes for a panel whose content is the reason it opened — a conversation, a document.
- `Avatar truncate` keeps the name and subtitle to one line each with an ellipsis, and puts the full name (and a string subtitle) in `title`. The Avatar has no `className`, so its wrapper still needs a width to shrink into (`min-w-0`).
- `Stepper variant="compact"` renders "Step *n* of *N*" over a thin progress track, with the ordered `aria-current="step"` list still in the DOM, visually hidden. `compactBelow="lg"` (or `sm`/`md`) shows that line below the breakpoint and the full list from it; exactly one form is displayed at any width. `formatPosition` words the line.
- Use `ExpandableTile` for optional detail blocks that can be controlled with `open` / `onOpenChange` or initialized with `defaultOpen`. Its open state is an overlay that stayed where it was, so do not stack more than a few in one view.
- Use `SeamGrid` for a set of related cells — stat tiles, rules, facts — so they read as one object rather than as separate cards. Pass a child count that divides evenly by every step (4 → 2 → 1); a hole in a grid of hairlines reads as a missing figure. `seamCorners` is exported for structures that cannot be a `SeamGrid`, such as `DescriptionList`'s `<dl>` and `Stepper`'s `<ol>`.
- In an app shell, give the top bar and the sidebar header `h-shell-bar` so their dividers line up.
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
- `ThemeToggle` is an icon-only button that toggles **light ↔ dark** in one press. It reads `resolvedTheme`, so until someone presses it the device's setting decides (keep `defaultTheme="system"` and `enableSystem` on the consumer's `ThemeProvider`), and a press stores the other theme. "System" is where a visitor starts, not a step in the toggle. The icon shows the theme on screen, the accessible name states the **action** ("Switch to dark theme"), and the new state is announced through a `role="status"` sibling instead of joining the name. `size` is `md` (44px, the default) or `sm` (36px).
- Use `SelectMenu`, not `Select`, when the option list has to match the theme: a native `<select>` popup is drawn by the OS and ignores the page's colours on several platforms.
- Use `TagPicker` for every multi-value choice over a closed list — a wall of checkboxes is unusable past about ten options and says nothing about which question it answers. It is a `role="group"` named from the `FormField` around it, over a multi-selectable listbox driven by `aria-activedescendant`, so focus never leaves the query and typing, filtering and moving are one gesture. Pass `onCreate` and the control offers to add an option the list does not have; omit it and it does not. The package never learns where the options come from.

Charts:
`BarChart`, `ChartShell`, `ChartTooltip`, `DonutChart`, `FunnelBars`, `Gauge`, `Heatmap`, `Legend`, `LineChart`, `ProgressRing`, `RankedBars`, `Sparkline`, `StackedBar`, `StepSegments`, `WeightedSegments`, `categoricalColor`, `sequentialColor`, `gridColor`, `axisLabelColor`, `trackColor`, `toneColor`, and the `ChartTone` type

### Choosing a chart

| The data is… | Use |
| --- | --- |
| one value toward a limit or goal (usage vs cap, setup done, a score out of 100) | `ProgressRing` — **and nothing else is a ring**: never a ring for a count with no denominator, never a ring per category |
| one whole split into parts | `StackedBar` (or `DonutChart` when there are few parts) |
| categories compared on one measure | `RankedBars` |
| a share of a denominator (a pipeline, a funnel) | `FunnelBars` |
| a trend | `Sparkline` beside a figure, `LineChart` (with `area` when the size matters) as a chart |
| a score in a table or list | `ScoreChip` |
| "n of total" discrete steps | `StepSegments` |
| a total made of weighted parts | `WeightedSegments` |
| one reading on a bounded scale | `Gauge` |
| a value per row × column | `Heatmap` |

Do not add a second chart that restates one already on the screen. A part takes a `tone` only when it is a status; otherwise leave `tone` and `color` unset and the categorical palette applies in order.

- **Meters** (`ProgressRing`, `Gauge`, `StepSegments`) are `role="meter"` and require a `label`, their accessible name. The drawing is `aria-hidden`; the figure is text, and `aria-valuetext` defaults to "*value* of *max*" (`valueText` overrides it on the ring). `ProgressRing`'s centre defaults to the share of `max` and may read 120% while the arc stops at full. Its caption shows from 56 px up. `Gauge`'s `marker` is a tick across the track, spoken with the value. `StepSegments` is warning until complete and success once complete unless `tone` says otherwise; keep it to a dozen or so steps.
- `StackedBar` is a named group: the bar is `aria-hidden` and the numbers are the legend's (value and, by default, share). With `legend={false}` they stay in an `sr-only` list. `onSelect` makes the legend entries buttons — the keyboard path — and the segments clickable.
- `RankedBars` scales to its largest value unless `max` fixes the scale; a value past `max` stops at full width. It renders in the order given, so sort first. A selectable row keeps `role="row"`; a real button named by the label is stretched over it. **`FunnelBars` is `RankedBars`** with `max` set to its denominator and a "count (share%)" value — change the shared layout in `RankedBars`.
- `WeightedSegments` sizes each part by `weight` and fills it by `value`. The shortfall is hatched in the warning hue (`shortfall="warning"`, the default) or left as track (`"neutral"`). Each part's figure is printed as `value/weight` and spoken as "value of weight".
- `Heatmap` is a captioned `<table>` with row and column headers, so it needs no view-as-table: every value is already in the page, `sr-only` unless `showValues`. `null` is "no data" (bare track), which is not zero (the faintest fill).
- `Legend` is the key every chart draws — `ChartShell` and `StackedBar` use it. `layout="stacked"` right-aligns the values; `onSelect` makes entries buttons.
- `LineChart area` fills under each series with a 12% wash of its colour (not stacked). `highlightIndex` marks one point with a dashed guide and a ringed dot per series.
- Arcs and bar fills ease between values with `duration-normal`/`ease-standard` and stop under `prefers-reduced-motion`.

`Sparkline` needs two points to be a line. Below that it renders the `notEnoughDataLabel` text instead of a chart — recharts falls back to drawing the lone point when a series has no line, and a single pale dot in an empty box reads as a rendering fault. That text is *not* `aria-hidden`, unlike the chart, because it is the only thing saying why the trend is missing.

`LineChart` needs two points too. With exactly one it keeps its header and "View as table", and says `notEnoughDataLabel` ("Not enough data yet") where the plot would be; an empty series still gets the empty state. Its `valueFormatter` formats the value axis's ticks as well as the tooltip and the table, and the axis sizes itself to the widest formatted tick (`width="auto"`), so `$1,250` neither clips nor pushes the plot. `yAxisLabel` names the unit ("US dollars") in a caption above the axis. Both come from `ChartShell`'s `notEnoughData` and `caption` props, which any other chart can pass.

`FunnelBars` takes a `label`. Its default names a lead pipeline, because that is what it was built for; anything else it breaks down — a trial funnel, a list of disqualification reasons — must pass its own, or its readers are told they are somewhere they are not.

Every chart goes through `ChartShell`: it owns the loading, empty and view-as-table states, so no chart is ever the only way to read its own numbers. All four wrappers disable Recharts' entry animation — it ignores `prefers-reduced-motion`, and a line drawn by animation is invisible in a background tab, in print and to screenshot tooling.

Icons:
Approved Phosphor exports are available from `@figuredout/ui-web/icons`, including `Gear`, `List`, `Pause`, `Plus`, `WarningCircle`, and the shared `PhosphorIcon` / `PhosphorIconProps` types.

## Chat

- **`ChatPane` needs a bounded parent.** It is `h-full min-h-0`: a header slot, a middle that takes every pixel the header and footer leave, and a footer slot. It only stays inside the viewport if every ancestor between it and the viewport has a bounded height — `h-dvh`, a grid row, or a flex item that is itself `min-h-0`. One ancestor without `min-h-0` and a long thread grows the page instead of scrolling the list, and the composer scrolls away with it. The pane paints nothing, so the same pane works as a page column or inside a `SidePanel size="xl"`. Its footer clears a phone's home indicator with `env(safe-area-inset-bottom)` (the page must set `viewport-fit=cover`).
- **`MessageList` is the scroll region, and three behaviours are why it exists.** A short thread is anchored to the bottom (the inner column is `min-h-full justify-end`; `justify-end` on the scroller itself would push a long thread off the top where no scrollbar reaches). It follows new content only while the reader is within `threshold` (80px) of the bottom; scrolled up, it leaves them there and shows a "Jump to latest" pill that becomes "New messages" once something arrives below. Prepending history keeps the reader's place: the list measures how far its first message moved and scrolls by that much (`overflow-anchor` is off so the browser does not correct the same jump twice). It is a `role="log"` — a polite live region — and focusable, so the keyboard can scroll it. Set `busy` while older messages load: `aria-busy` holds the announcements, or a screen reader reads out a page of history. `onReachTop` fires once on entering the top zone, never while `busy`. After the user sends, call the ref's `scrollToBottom()` so their own message always comes into view.
- **`MessageBubble` has three voices.** `incoming` (the other party) sits on the lifted surface with a hairline; `outgoing` (a person on this side) on the primary wash; `assistant` (outgoing text the product wrote) on `--color-chat-assistant`, a deeper solid wash of the same hue, so where a person took over is visible without reading meta lines. The meta line takes `label` (+ `labelIcon`), `time` (in a `<time>` when `dateTime` is set), `meta` and a delivery `status` tick whose words are `sr-only` except for `failed`, which prints "Not delivered". `groupPosition` (`first`/`middle`/`last`) tightens the corners where a run meets and pulls continuing bubbles up to 4px apart — it assumes `MessageList`'s 12px gap. Text keeps the sender's line breaks and long URLs wrap.
- `SystemEvent` is a centred, toned pill for something that happened *to* the conversation; unlike a `Badge` it may wrap. `DayDivider` is a mono uppercase caption between two hidden rules. `TypingIndicator` is three dots that stop moving under `prefers-reduced-motion` (they hold a static fade instead); its `label` is `sr-only` and is announced by the `MessageList` it sits in — outside one it is silent by design.
- **`Composer`** grows with its text up to `max-h-40`, then scrolls inside itself. Enter sends and Shift+Enter breaks the line; `sendKey="mod-enter"` swaps them. Enter is ignored during IME composition. Uncontrolled it clears itself after `onSend`; controlled (`value`/`onValueChange`) clearing is the caller's, so a failed send can keep the text. `sending` makes the send button busy (the package's pending convention) without locking the text. Slots: `attachAction` before the text, `actions` after it, `quickReplies` (+ `onQuickReply`) as a sideways-scrolling chip row above, `note` (+ `noteIcon`, `noteAction`) below — the note describes the textarea. Its focus ring follows the textarea only (`has-[textarea:focus]`), so tabbing to the attach button rings the button, not the composer.
- `ChatHeader` takes `leading` (a back button on a phone), `avatar`, `title` (an `h2` by default; `headingLevel` changes it), `status` beside the title, `subtitle`, and `actions`.

## Navigation and overlays added with chat

- **`SegmentedControl`** is the `Tabs` track without the panel — for a choice that filters or switches something elsewhere. It is a `radiogroup` by default (one Tab stop; arrows and Home/End move *and* select, skipping disabled segments, wrapping). `semantics="pressed"` makes it a row of `aria-pressed` toggles, each a Tab stop. `label` is required. `size` is `sm` (32px) or `md` (40px); `fullWidth` shares the width equally; `count` renders a mono tabular figure that is part of the segment's name.
- **`CommandPalette`** is a modal search over groups of items. It shares `Dialog`'s focus contract (`useDialogFocus`, now in `src/lib`): focus lands in the search field, Tab is trapped, Escape and the overlay close it, focus returns where it was. Inside it is a combobox over a listbox with `aria-activedescendant`, like `TagPicker`; Up/Down move across groups and wrap, skipping disabled items; Enter runs the item's `onSelect`, then the palette's `onSelect`, then closes (`keepOpenOnSelect` to stay). It filters on the title (or `textValue` when the title is not a string), a string subtitle and `keywords`; pass `filter={false}` when the app searches for itself, or a function to replace the match. A `role="status"` says the result count. `shortcut` keys are hints and are not bound. `useCommandPaletteShortcut(toggle)` binds ⌘K / Ctrl+K on the window; `enabled: false` pauses it.
- **`BottomNav`** is a phone's primary navigation: up to five items, each at least 52px tall, the active one `aria-current="page"`. Items are buttons that report an id through `onItemSelect`, as `DashboardShell`'s are, unless they carry `href`; `renderLink` draws those with the app's router link. `badge` is decoration (over 99 reads "99+"); `badgeLabel` puts its meaning in the item's name. It pads the bottom with `env(safe-area-inset-bottom)`. By default it is the last row of a full-height column; `fixed` pins it to the viewport instead.
- **`Popover`** is the package's first anchored panel for arbitrary content. `DropdownMenu` only takes command items, so a notification list could not live in it. It is non-modal: a `role="dialog"` with an `aria-label`, focus moves to the panel on open (not to its first control — in a notification list that is "Mark all read"), and it closes on Escape (focus back to the trigger), on a pointer press outside, and when focus leaves it for elsewhere on the page. `trigger` is a render prop: spread its props (ref, click, `aria-expanded`, `aria-haspopup`, `aria-controls`) onto a button — an `IconButton` takes them as they are. Positioned like `DropdownMenu`, with the same viewport clamp.
- **`NotificationList`** is the content of a notifications panel — header (title, a warning count badge, and a "Mark all read" button while anything is unread, or any `headerAction`), rows (a status-toned icon tile, a rich `title`, `subtitle`, `time`, an unread dot with `sr-only` words), optional `footer` — and nothing about where the panel lives. Rows with `href` are links (`renderLink` for a router), rows with `onSelect` are buttons, others are static. Use it in a `Popover` from a bell, or a `SidePanel` on a phone.
- **`Kbd`** is a key the reader presses: mono, hairlined, on no surface of its own. One per key; a chord is several side by side.

## Usage Rules

- Keep components reusable and presentational.
- Prefer extending this package over duplicating UI recipes in app code.
- Add tests for behavior changes, especially overlays, tabs, toasts, and keyboard behavior.
- Update `components.manifest.json` when adding or removing public exports.
