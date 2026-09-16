# External facts

Every fact carries its source and check date. Grades: **verified** (exercised here), **documented**
(stated by a manifest, lockfile or repo doc, not exercised), **assumed** (believed, no source in repo).
Checked 2026-09-17; nothing was run or browsed, so no entry is graded verified.

| Fact | Source | Confidence |
| --- | --- | --- |
| Peer ranges: React/ReactDOM `^18.2.0`, `next-themes` `^0.4.6`, Tailwind `^3.4.0` (optional) | `package.json` | documented |
| Installed locally: react 18.3.1, tailwindcss 3.4.19, next-themes 0.4.6, recharts 3.10.1, @phosphor-icons/react 2.1.10, storybook 10.5.7, vitest 3.2.7, typescript 5.9.3 | `node_modules/*/package.json` | documented |
| npm runs `prepare` for git dependencies and installs devDependencies to do it | commit `e8cefeb` message | documented |
| Recharts animates regardless of `prefers-reduced-motion`; animated lines are invisible in background tabs, print and screenshots | `AGENTS.md` | documented |
| A native `<select>` popup is drawn by the OS; `color-scheme` and option colours are ignored on several platforms | `docs/components.md` | documented |
| Container query units (`cqi`) resolve against the viewport without a `container-type` ancestor | `AGENTS.md`, `docs/components.md` | documented |
| `aria-labelledby` outranks every other accessible-name source | `docs/components.md` | documented |
| WCAG 2.x AA: 4.5:1 body text, 3:1 large text/UI | `docs/contrast-report.md` | documented |
| The preset is Tailwind 3 config shape and will not work unchanged under Tailwind 4 | none | assumed |
| React 19 consumers hit a peer-range conflict with `^18.2.0` | inferred from the range | assumed |
| `--font-sans` expects a `next/font` CSS variable from the consuming app | `AGENTS.md` | documented |
