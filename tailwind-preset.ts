import type { Config } from "tailwindcss"

const uiPreset: Config = {
  darkMode: "class",
  content: [],
  theme: {
    extend: {
      colors: {
        background: "var(--color-bg)",
        surface: "var(--color-surface)",
        "surface-raised": "var(--color-surface-raised)",
        "surface-sunken": "var(--color-surface-sunken)",
        fg: "var(--color-fg)",
        "fg-muted": "var(--color-fg-muted)",
        "fg-subtle": "var(--color-fg-subtle)",
        edge: "var(--color-edge)",
        "edge-strong": "var(--color-edge-strong)",
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        "primary-fg": "var(--color-primary-fg)",
        "primary-soft": "var(--color-primary-soft)",
        "focus-ring": "var(--color-focus-ring)",
        success: "var(--color-success)",
        "success-soft": "var(--color-success-soft)",
        warning: "var(--color-warning)",
        "warning-soft": "var(--color-warning-soft)",
        danger: "var(--color-danger)",
        "danger-fg": "var(--color-danger-fg)",
        "danger-soft": "var(--color-danger-soft)",
        info: "var(--color-info)",
        "info-soft": "var(--color-info-soft)",
        accent: "var(--color-accent)",
        "accent-fg": "var(--color-accent-fg)",
        "banner-fg": "var(--color-banner-fg)",
        "banner-muted": "var(--color-banner-muted)",
        "chart-cat-1": "var(--chart-cat-1)",
        "chart-cat-2": "var(--chart-cat-2)",
        "chart-cat-3": "var(--chart-cat-3)",
        "chart-cat-4": "var(--chart-cat-4)",
        "chart-cat-5": "var(--chart-cat-5)",
        "chart-cat-6": "var(--chart-cat-6)",
        "chart-seq": "var(--chart-seq)",
        "chart-grid": "var(--chart-grid)",
        "chart-axis-label": "var(--chart-axis-label)",
      },
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
