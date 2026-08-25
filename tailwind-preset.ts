import type { Config } from "tailwindcss"

/**
 * Tailwind's `/NN` opacity modifier can only fade a color it controls the
 * format of (an RGB triple, or a function like this one) — never a bare
 * `var(--x)` reference, whatever format the variable itself holds. Every
 * semantic color below used to be a plain `"var(--color-x)"` string, so
 * `ring-success/30`, `border-primary/30` and similar silently fell back to
 * Tailwind's *default* indigo instead of a faded version of the token —
 * every tone-colored ring or border with an opacity modifier, system-wide.
 * It read as "this component styles itself" rather than a config bug,
 * because the unmodified sibling utility right next to it — `bg-success-soft`,
 * `text-success` — worked fine.
 *
 * `color-mix` fades the variable itself, so it works regardless of the
 * token's underlying format (hex, rgb, oklch, a further `var()` indirection)
 * with no separate RGB-channel token needed. Unmodified usage — `opacityValue`
 * undefined — returns exactly the old `var(--x)` string, so this changes
 * nothing for a class with no `/NN`.
 */
function withAlpha(cssVar: string) {
  return ({ opacityValue }: { opacityValue?: string }) => {
    /* `opacityValue` is not only `undefined` or an explicit `/NN` modifier's
     * decimal string. textColor, backgroundColor, borderColor and a few
     * others have a companion `*-opacity` core plugin, and default the
     * modifier to a CSS-variable INDIRECTION — `var(--tw-text-opacity)` — so
     * a `text-opacity-50` utility elsewhere can still adjust it later via
     * the cascade. `Number(...)` on that string is `NaN`, which produced
     * `color-mix(in srgb, var(--x) NaN%, transparent)` — a real color that
     * renders as fully transparent — the first version of this fix shipped
     * that for every unmodified `text-*`/`bg-*` use before this test caught
     * it. Only a genuine `/NN` modifier resolves to a finite number; treat
     * everything else, indirection included, as "no modifier". */
    const percent = opacityValue === undefined ? NaN : Number(opacityValue) * 100
    return Number.isFinite(percent) ? `color-mix(in srgb, var(${cssVar}) ${percent}%, transparent)` : `var(${cssVar})`
  }
}

/* Tailwind has accepted a function in place of a color string since 3.0 —
 * it is how the framework's own docs show a custom opacity-aware color —
 * but @types/tailwindcss still types theme colors as string-only. The cast
 * bridges a real type-package gap, not an unsound guess about the runtime. */
type ColorValue = string | ReturnType<typeof withAlpha>

const uiPreset: Config = {
  darkMode: "class",
  content: [],
  theme: {
    extend: {
      colors: {
        background: withAlpha("--color-bg"),
        surface: withAlpha("--color-surface"),
        "surface-raised": withAlpha("--color-surface-raised"),
        "surface-sunken": withAlpha("--color-surface-sunken"),
        fg: withAlpha("--color-fg"),
        "fg-muted": withAlpha("--color-fg-muted"),
        "fg-subtle": withAlpha("--color-fg-subtle"),
        edge: withAlpha("--color-edge"),
        "edge-strong": withAlpha("--color-edge-strong"),
        primary: withAlpha("--color-primary"),
        "primary-hover": withAlpha("--color-primary-hover"),
        "primary-fg": withAlpha("--color-primary-fg"),
        "primary-soft": withAlpha("--color-primary-soft"),
        "focus-ring": withAlpha("--color-focus-ring"),
        success: withAlpha("--color-success"),
        "success-soft": withAlpha("--color-success-soft"),
        warning: withAlpha("--color-warning"),
        "warning-soft": withAlpha("--color-warning-soft"),
        danger: withAlpha("--color-danger"),
        "danger-fg": withAlpha("--color-danger-fg"),
        "danger-soft": withAlpha("--color-danger-soft"),
        info: withAlpha("--color-info"),
        "info-soft": withAlpha("--color-info-soft"),
        accent: withAlpha("--color-accent"),
        "accent-fg": withAlpha("--color-accent-fg"),
        "banner-fg": withAlpha("--color-banner-fg"),
        "banner-muted": withAlpha("--color-banner-muted"),
        "chart-cat-1": withAlpha("--chart-cat-1"),
        "chart-cat-2": withAlpha("--chart-cat-2"),
        "chart-cat-3": withAlpha("--chart-cat-3"),
        "chart-cat-4": withAlpha("--chart-cat-4"),
        "chart-cat-5": withAlpha("--chart-cat-5"),
        "chart-cat-6": withAlpha("--chart-cat-6"),
        "chart-seq": withAlpha("--chart-seq"),
        "chart-grid": withAlpha("--chart-grid"),
        "chart-axis-label": withAlpha("--chart-axis-label"),
      } satisfies Record<string, ColorValue> as unknown as Record<string, string>,
      borderColor: {
        edge: "var(--color-edge)",
        "edge-strong": "var(--color-edge-strong)",
        seam: "var(--seam)",
      },
      textColor: {
        fg: "var(--color-fg)",
        "fg-muted": "var(--color-fg-muted)",
        "fg-subtle": "var(--color-fg-subtle)",
      },
      backgroundColor: {
        background: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-raised": "var(--color-surface-raised)",
        "surface-sunken": "var(--color-surface-sunken)",
        primary: "var(--color-primary)",
        "primary-soft": "var(--color-primary-soft)",
        accent: "var(--color-accent)",
        /* The ground a SeamGrid shows through its 1px gaps. */
        seam: "var(--seam)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        DEFAULT: "var(--radius-md)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        raised: "var(--shadow-raised)",
        hover: "var(--shadow-hover)",
        overlay: "var(--shadow-overlay)",
      },
      transitionDuration: {
        fast: "var(--motion-fast)",
        normal: "var(--motion-normal)",
      },
      keyframes: {
        /* A loading placeholder sweeps rather than pulses: a pulse reads as
         * something asking for attention, a sweep as something still arriving. */
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        /* Content arriving in place: an opened tile's body, a menu, a toast. */
        rise: {
          from: { opacity: "0", transform: "translateY(-6px)" },
          to: { opacity: "1", transform: "none" },
        },
        /* A sheet arriving from the edge it is anchored to. */
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(24px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s linear infinite",
        rise: "rise var(--motion-normal) var(--ease-standard)",
        "slide-in-right": "slide-in-right var(--motion-normal) var(--ease-standard)",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        xs: ["var(--text-xs)", { lineHeight: "var(--leading-xs)" }],
        sm: ["var(--text-sm)", { lineHeight: "var(--leading-sm)" }],
        base: ["var(--text-base)", { lineHeight: "var(--leading-base)" }],
        lg: ["var(--text-lg)", { lineHeight: "var(--leading-lg)" }],
        xl: ["var(--text-xl)", { lineHeight: "var(--leading-xl)" }],
        "2xl": ["var(--text-2xl)", { lineHeight: "var(--leading-2xl)" }],
        "3xl": ["var(--text-3xl)", { lineHeight: "var(--leading-3xl)" }],
        "4xl": ["var(--text-4xl)", { lineHeight: "var(--leading-4xl)" }],
        display: ["var(--text-display)", { lineHeight: "var(--leading-display)" }],
      },
      maxWidth: {
        measure: "var(--measure)",
      },
      padding: {
        gut: "var(--gut)",
      },
      zIndex: {
        nav: "var(--z-nav)",
        overlay: "var(--z-overlay)",
        toast: "var(--z-toast)",
      },
    },
  },
  plugins: [],
}

export default uiPreset
