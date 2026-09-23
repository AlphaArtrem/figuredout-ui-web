# Plan

Phased build order. Each phase's acceptance is a demonstration, not a passing suite.

## Completed (from git history)

| Phase | Dates | Demonstration |
| --- | --- | --- |
| 1. Extract the package | 2026-07-19 – 08-10 | Primitives, patterns and dashboard shell importable from `@figuredout/ui-web`; Storybook explorer runs |
| 2. Surface-ladder redesign | 2026-08-13 – 08-16 | Every component on the four-step ladder in light and dark; holds together at phone width |
| 3. Consumable from GitHub | 2026-08-22 – 08-30 | `npm i github:AlphaArtrem/figuredout-ui-web` yields a built package; FiguredoutAI palette applied with contrast report |
| 4. Accessibility and form hardening | 2026-09-04 – 09-11 | Named controls, announced pending/error states, keyboard-reachable wide tables, `TagPicker`, `NumberField`, warning button, compact `Stepper` |
| 5. Data visualisation set | 2026-09-23 (`ds/dataviz`) | Every chart form the dashboard redesign uses — ring, gauge, step segments, stacked bar, weighted segments, ranked bars, heatmap, area line, score chip — themed in light and dark, with stories and tests |

## Not yet planned

Nothing beyond phase 4 is recorded in the repository. Candidate work visible in the repo, unscheduled and
unapproved:

- **Automated checks** for invariants 1–4 in `state.md` (no CI exists). Acceptance: a deliberately missing
  barrel export or broken story fails a check without anyone running a command by hand.
- **Contrast measurement as a script** (invariant 6). Acceptance: a token change that drops a pair below AA
  is reported by a command.
- **Release/versioning rule** for export changes (invariant 7). Acceptance: a consumer can tell from the
  installed version whether an export exists.

## Open questions

- Is npm publishing intended (`publishConfig.access: public`, `license: UNLICENSED`), or git installs only?
  Blocks: release/versioning work.
- Should agent docs ship in the tarball (`files` includes `docs`)? Blocks: nothing yet.
- Which consuming repos still vendor `0.0.1`? Blocks: any breaking export change.
