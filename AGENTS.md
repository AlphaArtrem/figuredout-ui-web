# AGENTS.md

## Package Contract

- This repository is the standalone source for `@figuredout/ui-web`.
- Keep components presentational: props in, callbacks out, no app data fetching.
- Preserve the public exports in `package.json` unless a breaking change is intentional and documented.
- Treat React, ReactDOM, `next-themes`, and Tailwind as consumer-provided peers.

## Working Style

- Prefer small, focused changes and existing component patterns.
- Keep design tokens centralized in `styles/tokens.css` and `tailwind-preset.ts`.
- Use semantic token classes instead of raw palette utilities or one-off hex colors.
- Update README, `COMPONENT_GUIDE.md`, or `components.manifest.json` when public imports or component availability changes.

## Validation

- Run `npm run build` after TypeScript or export changes.
- Run `npm run test` after component behavior changes.
- Run `npm pack --dry-run` before publishing-related changes.
