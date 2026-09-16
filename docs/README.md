# Docs index

One job per file. Put a fact in the one file that owns it and link to it from anywhere else.

| File | Job |
| --- | --- |
| [`../AGENTS.md`](../AGENTS.md) | Agent instructions: package contract, rules, validation, session protocol, incidents already hit |
| [`../README.md`](../README.md) | Public consumer docs: install, public imports, component surface, token catalog |
| [`../COMPONENT_GUIDE.md`](../COMPONENT_GUIDE.md) | Consumer usage guide per component |
| [`components.md`](components.md) | Surface ladder, the shared rules, choosing a component, editing gotchas |
| [`contrast-report.md`](contrast-report.md) | Measured WCAG contrast of token pairs |
| [`state.md`](state.md) | What exists today, settled decisions, invariants, the next action |
| [`plan.md`](plan.md) | Build order: completed phases and what is not yet planned |
| [`external-facts.md`](external-facts.md) | Versions and platform behaviour the package depends on, with source and confidence |
| [`hazards.md`](hazards.md) | Predicted failure modes not yet seen as incidents |

`components.manifest.json` is the machine-readable export list; `hybrid-mockup/` is the static design reference.

Note: `package.json` `files` includes `docs`, so everything in this directory ships in the npm tarball.
