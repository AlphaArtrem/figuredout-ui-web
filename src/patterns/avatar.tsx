import type { ReactNode } from "react"
import { UserCircle } from "../icons/index.js"
import { cn } from "../lib/cn.js"

type AvatarSize = "sm" | "md" | "lg"

const SIZE_STYLES: Record<AvatarSize, string> = {
  sm: "h-9 w-9 text-sm",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
}

export interface AvatarProps {
  name: string
  size?: AvatarSize
  src?: string
  subtitle?: ReactNode
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function Avatar({ name, size = "md", src, subtitle }: AvatarProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "inline-flex items-center justify-center overflow-hidden rounded-full bg-primary-soft font-semibold text-primary",
          SIZE_STYLES[size],
        )}
      >
        {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : getInitials(name) || <UserCircle size={18} />}
      </div>
      <div>
        <p className="text-sm font-semibold text-fg">{name}</p>
        {subtitle ? <p className="text-sm text-fg-muted">{subtitle}</p> : null}
      </div>
    </div>
  )
}
