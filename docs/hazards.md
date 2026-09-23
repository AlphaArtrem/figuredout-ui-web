# Hazards

**Predictions**, not lessons. Incidents that have actually happened live in `AGENTS.md` ("Things That Have
Already Bitten Us") and `docs/components.md` ("Gotchas"). When a prediction below occurs, move it there with
the concrete incident and delete it here.

- **A broken `prepare` breaks every consumer install at once.** Git installs build on install, so a TypeScript
  error on `main` is a failed install downstream, not just a red build here.
- **Silent export removal.** Exports have been added and removed within a day without a version bump
  (`4e952d6`, `fefc972`). A consumer that adopted one in between breaks on its next install at the same version.
- **Parallel branches adding exports at one version.** `ds/dataviz` and `ds/chat-nav` both add public exports
  on top of `0.1.0` without a bump. Merged together at the same version, a consumer cannot tell from the
  installed version which exports it has (invariant 7).
- **`color-mix()` in chart fills.** `FunnelBars` shading and `Heatmap` cells are `color-mix(in srgb, …)`, as the
  preset's `/NN` opacity modifiers already are. A browser without it paints those fills transparent.
- **Stale vendored tarballs.** Consumers still on `0.0.1` tarballs will not see fixes and may diverge silently
  from Storybook.
- **Peer-range drift.** A consumer moving to React 19 or Tailwind 4 gets peer conflicts or a preset that no
  longer applies (see `external-facts.md`, assumed).
- **Contrast report drift.** Token edits without re-measuring leave `contrast-report.md` claiming passes that
  no longer hold.
- **Docs in the tarball.** `files` includes `docs`, so anything written here is published with the package.
- **Mockup mistaken for source.** `hybrid-mockup/` looks like components but is not built; edits there change
  nothing a consumer receives. Its own README calls it throwaway while `AGENTS.md` calls it the design
  reference — the two disagree on its status.
- **No CI.** Every invariant in `state.md` depends on someone running the commands by hand.
