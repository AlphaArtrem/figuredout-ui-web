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

Measured against the FiguredoutAI palette — ink `#030A0E`, sky `#90C2E7`, peak `#C9E4F5`, paper `#F0EDEF`,
with deep teal `#1B6579`, green `#4FA87C`, amber `#E8A33D` and terracotta `#D4645A` supporting.

## Results
### Light

| Pair | Ratio | AA body | AA large/UI |
|---|---|---|---|
| `--color-fg` on `--color-bg` | 17.71:1 | pass | pass |
| `--color-fg` on `--color-surface` | 19.00:1 | pass | pass |
| `--color-fg` on `--color-surface-raised` | 19.93:1 | pass | pass |
| `--color-fg-muted` on `--color-bg` | 10.30:1 | pass | pass |
| `--color-fg-muted` on `--color-surface` | 11.05:1 | pass | pass |
| `--color-fg-muted` on `--color-surface-sunken` | 9.45:1 | pass | pass |
| `--color-fg-subtle` on `--color-surface` | 7.16:1 | pass | pass |
| `--color-fg-subtle` on `--color-surface-sunken` | 6.12:1 | pass | pass |
| `--color-primary-fg` on `--color-primary` | 6.84:1 | pass | pass |
| `--color-danger-fg` on `--color-danger` | 7.46:1 | pass | pass |
| `--color-accent-fg` on `--color-accent` | 7.87:1 | pass | pass |
| `--color-primary` on `--color-surface` | 7.58:1 | pass | pass |
| `--color-danger` on `--color-surface` | 7.75:1 | pass | pass |
| `--color-success` on `--color-surface` | 6.88:1 | pass | pass |
| `--color-warning` on `--color-surface` | 8.22:1 | pass | pass |
| `--color-info` on `--color-surface` | 8.46:1 | pass | pass |
| `--color-accent` on `--color-surface` | 8.18:1 | pass | pass |

| Semantic text on its own `-soft` wash | Ratio | AA body |
|---|---|---|
| `--color-primary` on `--color-primary-soft` over `--color-surface` | 6.49:1 | pass |
| `--color-success` on `--color-success-soft` over `--color-surface` | 5.94:1 | pass |
| `--color-warning` on `--color-warning-soft` over `--color-surface` | 7.25:1 | pass |
| `--color-danger` on `--color-danger-soft` over `--color-surface` | 6.48:1 | pass |
| `--color-info` on `--color-info-soft` over `--color-surface` | 7.23:1 | pass |

### Dark

| Pair | Ratio | AA body | AA large/UI |
|---|---|---|---|
| `--color-fg` on `--color-bg` | 17.15:1 | pass | pass |
| `--color-fg` on `--color-surface` | 15.70:1 | pass | pass |
| `--color-fg` on `--color-surface-raised` | 13.62:1 | pass | pass |
| `--color-fg-muted` on `--color-bg` | 9.27:1 | pass | pass |
| `--color-fg-muted` on `--color-surface` | 8.49:1 | pass | pass |
| `--color-fg-muted` on `--color-surface-sunken` | 9.52:1 | pass | pass |
| `--color-fg-subtle` on `--color-surface` | 5.59:1 | pass | pass |
| `--color-fg-subtle` on `--color-surface-sunken` | 6.26:1 | pass | pass |
| `--color-primary-fg` on `--color-primary` | 10.49:1 | pass | pass |
| `--color-danger-fg` on `--color-danger` | 6.76:1 | pass | pass |
| `--color-accent-fg` on `--color-accent` | 15.09:1 | pass | pass |
| `--color-primary` on `--color-surface` | 9.61:1 | pass | pass |
| `--color-danger` on `--color-surface` | 6.70:1 | pass | pass |
| `--color-success` on `--color-surface` | 7.77:1 | pass | pass |
| `--color-warning` on `--color-surface` | 8.46:1 | pass | pass |
| `--color-info` on `--color-surface` | 8.75:1 | pass | pass |
| `--color-accent` on `--color-surface` | 13.82:1 | pass | pass |

| Semantic text on its own `-soft` wash | Ratio | AA body |
|---|---|---|
| `--color-primary` on `--color-primary-soft` over `--color-surface` | 6.98:1 | pass |
| `--color-success` on `--color-success-soft` over `--color-surface` | 6.12:1 | pass |
| `--color-warning` on `--color-warning-soft` over `--color-surface` | 6.44:1 | pass |
| `--color-danger` on `--color-danger-soft` over `--color-surface` | 5.49:1 | pass |
| `--color-info` on `--color-info-soft` over `--color-surface` | 6.17:1 | pass |

## Notes

- **Dark mode is the canonical theme.** Its values are the marketing site's own scheme, so the product and
  the site read as one thing rather than as two projects that share a logo.
- **Light mode re-levels the same hues; it does not recolour them.** `--color-primary` is the deep teal
  `#15586b` rather than the sky, because the sky reaches 1.8:1 on a paper ground and is unreadable as text or
  as a control boundary. Everything warm and green is likewise darkened until it clears AA on `surface`.
- **`--color-primary-soft` is 0.10 in light, where every other wash is 0.12–0.18.** At 0.12 the teal lightens
  its own ground enough to pull `primary` on `primary-soft` to 4.4:1 — the exact composite a
  `Badge tone="primary"` produces. This was the one pair the previous green palette shipped below AA (4.11:1),
  and it is fixed here rather than carried forward.
- Check semantic text against its *soft* background, not against the surface: the wash lightens the ground
  under it, and that is where the old `--color-success` was failing.
- `--color-accent` is the brand's peak tint in dark and a deep clay in light. The brand supplies five
  distinct hues and the system names six semantic roles, so accent is the one that takes a tint of an
  existing hue rather than a sixth of its own — it is unused by any component today, and named here so a
  future `tone="accent"` has somewhere defined to land.
- Chart categorical colours are not listed. They carry meaning through position and a legend, not through
  contrast against the page, and are held to the 3:1 non-text bar plus a distinctness check against each
  other. All six clear 6.7:1 in both themes.
- The wallpaper glows are excluded: they are decorative, never carry text, and run at 6–22% opacity.
