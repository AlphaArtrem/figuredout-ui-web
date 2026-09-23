import type { ReactNode } from "react"
import { cn } from "../lib/cn.js"
import { Badge } from "../primitives/badge.js"

export interface StatCardProps {
  /**
   * A small visual beside the figure — a `Sparkline`, a `StepSegments`, a small
   * `ProgressRing`. It sits at the figure's baseline edge and takes up to two
   * fifths of the tile; the figure shrinks to make room rather than wrapping.
   * Decoration of the figure, so anything it shows must also be in the text.
   */
  aside?: ReactNode
  className?: string
  delta?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  tone?: "neutral" | "primary" | "success" | "warning" | "danger" | "info"
  title: ReactNode
  value: ReactNode
}

/* A metric tile. On its own it carries its own surface; inside a SeamGrid the
 * grid supplies the surface and the corners, so the tile drops them — which is
 * what `standalone={false}` is for. A row of related figures should read as one
 * object, not as four cards that happen to be near each other.
 *
 * The figure is sized against its CONTAINER, not the viewport: a narrow cell
 * gets smaller digits instead of a second line. The clamp's middle value is set
 * from the longest string the slot actually holds. */
export function StatCard({ aside, className, delta, description, icon, tone = "neutral", title, value }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col rounded-xl bg-surface p-5 shadow-raised ring-1 ring-inset ring-edge",
        "transition duration-normal ease-standard hover:-translate-y-0.5 hover:shadow-hover hover:ring-edge-strong",
        "motion-reduce:transform-none",
        "[container-type:inline-size]",
        className,
      )}
    >
      <StatCardContent
        aside={aside}
        delta={delta}
        description={description}
        icon={icon}
        title={title}
        tone={tone}
        value={value}
      />
    </div>
  )
}

/**
 * The tile's contents without a surface of its own, for use as a SeamGrid cell.
 * SeamGrid owns the background, padding and corners; this owns the figure.
 */
export function StatCardContent({ aside, delta, description, icon, title, tone = "neutral", value }: StatCardProps) {
  return (
    <>
      {/* In a narrow tile the icon moves above the caption instead of beside it.
          Beside it, a 156 px phone tile left the caption 72 px, and a caption
          word longer than that ("CONVERSATIONS") cannot wrap, so it ran under
          the icon. 12rem is the tile's content width below which a long caption
          word and the 44 px icon column no longer fit side by side. The tile is
          its own container (or SeamGrid's cell is), so this follows the tile,
          not the viewport. `break-words` is the last resort for a caption word
          wider than even the whole tile. */}
      <div className="flex items-start justify-between gap-3 [@container(max-width:12rem)]:flex-col-reverse">
        <p className="m-0 min-w-0 break-words font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-fg-subtle">
          {title}
        </p>
        {icon ? (
          <div className="inline-grid size-8 shrink-0 place-items-center rounded-md border border-primary/30 bg-primary-soft text-primary [&_svg]:size-4">
            {icon}
          </div>
        ) : null}
      </div>
      {/* A `div`, not a `p`: the slot is a `ReactNode`, and the obvious thing to
          put in it while the figure loads is this package's own `Skeleton`, which
          is a `div`. Inside a `p` that is invalid HTML — the parser closes the
          `p` early and hydration disagrees (play_2_hire `traps.md` §97). Preflight
          zeroes a `p`'s margins, so the tile looks exactly as it did. */}
      {aside != null ? (
        /* The figure's clamp drops from 10.5cqi to 7cqi: it now shares the
           row with the aside, and a figure that wraps or runs under the chart
           is worse than a smaller one. */
        <div className="mt-2 flex items-end justify-between gap-3">
          <div className="min-w-0 whitespace-nowrap font-mono text-[clamp(1.25rem,7cqi,2.75rem)] font-semibold leading-none tracking-[-0.02em] tabular-nums text-fg">
            {value}
          </div>
          <div className="flex w-2/5 min-w-0 max-w-32 shrink-0 justify-end">{aside}</div>
        </div>
      ) : (
        <div className="mt-2 whitespace-nowrap font-mono text-[clamp(1.25rem,10.5cqi,2.75rem)] font-semibold leading-none tracking-[-0.02em] tabular-nums text-fg">
          {value}
        </div>
      )}
      <div className="mt-3 flex items-center gap-2">
        {delta ? <Badge tone={tone}>{delta}</Badge> : null}
        {description ? <div className="flex-1 text-[0.8125rem] leading-relaxed text-fg-muted">{description}</div> : null}
      </div>
    </>
  )
}
