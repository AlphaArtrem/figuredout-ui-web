import type { HTMLAttributes, ReactNode } from "react"
import { Info, WarningCircle } from "../icons/index.js"
import { cn } from "../lib/cn.js"

type InfoBannerTone = "neutral" | "info" | "warning" | "danger" | "success"

export interface InfoBannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  actions?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  title?: ReactNode
  tone?: InfoBannerTone
}

/* Each tone gains a bar on its leading edge, so a stack of banners is scannable
 * by tone without any of them shouting — and so the tone is not carried by
 * colour alone. The bar is a left border on a rounded box, which curves into
 * the corners rather than being clipped by them. */
const TONE_STYLES: Record<InfoBannerTone, string> = {
  neutral: "border-l-edge-strong ring-edge bg-surface-raised text-fg",
  info: "border-l-info ring-info/30 bg-info-soft text-info",
  warning: "border-l-warning ring-warning/35 bg-warning-soft text-warning",
  danger: "border-l-danger ring-danger/35 bg-danger-soft text-danger",
  success: "border-l-success ring-success/35 bg-success-soft text-success",
}

/* A grid of icon | text | actions. From `sm` that is one row, and it renders
 * what the old `flex justify-between` row did: the 12 px icon gap, and 16 px
 * before the actions (`gap-x-3` plus the actions' `ml-1`).
 *
 * Below `sm` the actions drop to a second row, under the text and aligned with
 * it. Beside the text they took a fixed column out of a 390 px screen, so the
 * sentence wrapped at about 150 px — six lines for a 78-character description —
 * and every second control made that column wider still (play_2_hire
 * `traps.md` §99). Several controls sit in a wrapping row, so a caller hands
 * over the buttons and never has to stack them itself.
 *
 * Without actions there is no third column at all, so the gap before an empty
 * track does not narrow the text. */
export function InfoBanner({
  actions,
  className,
  description,
  icon,
  title,
  tone = "neutral",
  ...props
}: InfoBannerProps) {
  const fallbackIcon = tone === "warning" || tone === "danger"
    ? <WarningCircle size={18} aria-hidden="true" />
    : <Info size={18} aria-hidden="true" />

  return (
    <div
      role={tone === "danger" || tone === "warning" ? "alert" : "status"}
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 rounded-lg border-0 border-l-4 px-4 py-3 ring-1 ring-inset",
        actions ? "gap-y-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]" : null,
        TONE_STYLES[tone],
        className,
      )}
      {...props}
    >
      <span className="mt-0.5 shrink-0">{icon ?? fallbackIcon}</span>
      <div className="grid min-w-0 gap-1">
        {title ? <div className="text-sm font-semibold text-fg">{title}</div> : null}
        {description ? <div className="text-sm text-fg-muted">{description}</div> : null}
      </div>
      {actions ? (
        <div className="col-start-2 flex flex-wrap items-center gap-2 sm:col-start-3 sm:row-start-1 sm:ml-1">
          {actions}
        </div>
      ) : null}
    </div>
  )
}
