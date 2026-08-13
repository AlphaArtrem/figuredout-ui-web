# Contrast report

Measured from `styles/tokens.css` with the WCAG 2.x relative-luminance formula. Regenerate after any token
change — the script is short enough to keep in the PR description rather than the repo, and the numbers below
are the ones that matter for review:

```js
const lum = (rgb) => rgb.map(c => c / 255)
  .map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0)
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }
```

**AA body** is 4.5:1 (text under 18.66px regular). **AA large/UI** is 3:1 (large text, icons, control
boundaries). Every pair below clears the bar it needs.

## Results
### Light

| Pair | Ratio | AA body | AA large/UI |
|---|---|---|---|
| `--color-fg` on `--color-bg` | 16.90:1 | pass | pass |
| `--color-fg` on `--color-surface` | 18.00:1 | pass | pass |
| `--color-fg` on `--color-surface-raised` | 18.73:1 | pass | pass |
| `--color-fg-muted` on `--color-bg` | 10.30:1 | pass | pass |
| `--color-fg-muted` on `--color-surface` | 10.98:1 | pass | pass |
| `--color-fg-muted` on `--color-surface-sunken` | 9.47:1 | pass | pass |
| `--color-fg-subtle` on `--color-surface` | 7.21:1 | pass | pass |
| `--color-fg-subtle` on `--color-surface-sunken` | 6.22:1 | pass | pass |
| `--color-primary-fg` on `--color-primary` | 4.79:1 | pass | pass |
| `--color-danger-fg` on `--color-danger` | 9.12:1 | pass | pass |
| `--color-primary` on `--color-surface` | 4.82:1 | pass | pass |
| `--color-danger` on `--color-surface` | 9.63:1 | pass | pass |
| `--color-success` on `--color-surface` | 5.66:1 | pass | pass |
| `--color-warning` on `--color-surface` | 8.33:1 | pass | pass |
| `--color-info` on `--color-surface` | 9.95:1 | pass | pass |

### Dark

| Pair | Ratio | AA body | AA large/UI |
|---|---|---|---|
| `--color-fg` on `--color-bg` | 18.07:1 | pass | pass |
| `--color-fg` on `--color-surface` | 16.85:1 | pass | pass |
| `--color-fg` on `--color-surface-raised` | 15.24:1 | pass | pass |
| `--color-fg-muted` on `--color-bg` | 7.36:1 | pass | pass |
| `--color-fg-muted` on `--color-surface` | 6.86:1 | pass | pass |
| `--color-fg-muted` on `--color-surface-sunken` | 7.06:1 | pass | pass |
| `--color-fg-subtle` on `--color-surface` | 5.12:1 | pass | pass |
| `--color-fg-subtle` on `--color-surface-sunken` | 5.27:1 | pass | pass |
| `--color-primary-fg` on `--color-primary` | 10.62:1 | pass | pass |
| `--color-danger-fg` on `--color-danger` | 5.84:1 | pass | pass |
| `--color-primary` on `--color-surface` | 12.53:1 | pass | pass |
| `--color-danger` on `--color-surface` | 6.36:1 | pass | pass |
| `--color-success` on `--color-surface` | 10.25:1 | pass | pass |
| `--color-warning` on `--color-surface` | 9.17:1 | pass | pass |
| `--color-info` on `--color-surface` | 6.92:1 | pass | pass |

## Notes

- The light theme sits on a tinted ladder rather than white, so the headline pairs come out slightly lower
  than they did against `#ffffff` — `fg-muted` on `surface` is 10.98:1 against a previous 16.83:1 on pure
  white. Every pair still clears AA with several stops of headroom.
- `--color-success` was darkened from `#16a34a` to `#0f7434`. At the old value, success text reached only
  3.17:1 on `surface` and **2.77:1 on its own soft wash** — the exact composite a `Badge tone="success"`
  produces — which is below AA for body copy. Check semantic text against its *soft* background, not against
  the surface: the wash lightens the ground under it.
- Chart categorical colours are not listed. They carry meaning through position and a legend, not through
  contrast against the page, and are held to the 3:1 non-text bar plus a distinctness check against each
  other.

## When you change a token

1. Re-measure every pair in the table above, not only the one you touched — the surfaces are a ladder, so
   moving one step changes what sits on it.
2. Measure semantic text against its `-soft` companion composited over the surface, not against the surface.
3. If a pair drops below AA, darken the *foreground*. Lightening the surface pushes the whole ladder and
   costs the elevation story.
