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
  /**
   * Keep the name and subtitle to one line each, cut with an ellipsis, in a
   * column narrower than they are. The full name is in `title`, and so is a
   * string subtitle; the full text of both stays in the DOM, so a screen reader
   * reads all of it. Off by default: without it both lines wrap, as before.
   */
  truncate?: boolean
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

/* `truncate` needs three things beyond the `truncate` utility, and missing any
 * one of them is a truncation that silently does nothing: `min-w-0` on the row
 * and on the text column, or a flex item refuses to shrink below its content;
 * and `shrink-0` on the circle, or the circle is what gives way first. The
 * caller still has to give the Avatar a width to live in (`min-w-0` on its own
 * wrapper) — this component has no `className` and cannot size itself. */
export function Avatar({ name, size = "md", src, subtitle, truncate = false }: AvatarProps) {
  const subtitleText = typeof subtitle === "string" || typeof subtitle === "number" ? String(subtitle) : undefined

  return (
    <div className={cn("flex items-center gap-3", truncate && "min-w-0")}>
      <div
        className={cn(
          "inline-flex items-center justify-center overflow-hidden rounded-full bg-primary-soft font-semibold text-primary",
          "ring-1 ring-inset ring-primary/20",
          truncate && "shrink-0",
          SIZE_STYLES[size],
        )}
      >
        {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : getInitials(name) || <UserCircle size={18} />}
      </div>
      <div className={truncate ? "min-w-0" : undefined}>
        <p className={cn("text-sm font-semibold text-fg", truncate && "truncate")} title={truncate ? name : undefined}>
          {name}
        </p>
        {subtitle ? (
          <p className={cn("text-sm text-fg-muted", truncate && "truncate")} title={truncate ? subtitleText : undefined}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  )
}
