# Contrast report

Validated manually against the Phase 1 semantic text pairs after token tuning.

## Light mode

| Pair | Ratio |
|---|---|
| `--color-fg` on `--color-bg` | 16.37:1 |
| `--color-fg` on `--color-surface` | 16.83:1 |
| `--color-fg-muted` on `--color-bg` | 6.71:1 |
| `--color-fg-muted` on `--color-surface-sunken` | 6.22:1 |
| `--color-primary-fg` on `--color-primary` | 5.20:1 |

## Dark mode

| Pair | Ratio |
|---|---|
| `--color-fg` on `--color-bg` | 16.73:1 |
| `--color-fg` on `--color-surface` | 15.57:1 |
| `--color-fg-muted` on `--color-bg` | 9.76:1 |
| `--color-fg-muted` on `--color-surface-sunken` | 9.36:1 |
| `--color-primary-fg` on `--color-primary` | 7.05:1 |

## Chart palette validation

Run the vendored validator before changing any chart token:

```bash
node docs/redesign/scripts/validate_palette.js "#0f8f83,#8b5cf6,#516fd4,#b05a36,#d97706,#9f6d2c" --mode light
node docs/redesign/scripts/validate_palette.js "#9333ea,#0d9488,#c2410c,#7c3aed,#db2777,#2563eb" --mode dark
```
