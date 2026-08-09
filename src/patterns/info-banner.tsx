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

const TONE_STYLES: Record<InfoBannerTone, string> = {
  neutral: "border-edge bg-surface-raised text-fg",
  info: "border-info/30 bg-info-soft text-info",
  warning: "border-warning/35 bg-warning-soft text-warning",
  danger: "border-danger/35 bg-danger-soft text-danger",
  success: "border-success/35 bg-success-soft text-success",
}

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
        "flex items-start justify-between gap-4 rounded-lg border px-4 py-3",
        TONE_STYLES[tone],
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 shrink-0">{icon ?? fallbackIcon}</span>
        <div className="grid min-w-0 gap-1">
          {title ? <div className="text-sm font-semibold text-fg">{title}</div> : null}
          {description ? <div className="text-sm text-fg-muted">{description}</div> : null}
        </div>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  )
}
