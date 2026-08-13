import { Children, isValidElement, cloneElement } from "react"
import type { HTMLAttributes, ReactElement, ReactNode } from "react"
import { cn } from "../lib/cn.js"

export interface SeamGridProps extends HTMLAttributes<HTMLElement> {
  /**
   * Cells per row at the widest breakpoint. Steps down through 2 to 1 as the
   * viewport narrows, and the steps are chosen so the count always divides
   * evenly — a hole in a grid of hairlines reads as a missing figure, not as an
   * empty slot. Pass a child count that divides by every step.
   */
  columns?: 2 | 3 | 4
  /** Renders as `ul` when the cells are a list of peers rather than regions. */
  as?: "div" | "ul"
}

/* Cards in a line read as one object.
 *
 * The hairline between two cells is a 1px GAP over a seam-coloured ground, not
 * a border on each cell: no doubled lines where two cells meet, and no page
 * showing through the gap.
 *
 * The corners are the whole problem at this radius. `overflow-hidden` on the
 * frame would round them, but it also clips the hover shadow, and a lift that
 * gets sliced at the frame edge looks broken — so the CORNER CELLS carry the
 * radius themselves, recomputed per breakpoint, and the frame stays unclipped.
 *
 * The hover is a surface change, not a lift: raising a seam cell opens a 1px
 * sliver of seam ground beneath it, which at this radius shows at the rounded
 * corners.
 */
const COLUMN_STYLES: Record<2 | 3 | 4, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
}

/* Written out rather than built from template literals so Tailwind's scanner
 * can see every class it has to generate. */
const CORNERS = {
  base: {
    reset: "rounded-none",
    tl: "rounded-tl-xl",
    tr: "rounded-tr-xl",
    bl: "rounded-bl-xl",
    br: "rounded-br-xl",
  },
  sm: {
    reset: "sm:rounded-none",
    tl: "sm:rounded-tl-xl",
    tr: "sm:rounded-tr-xl",
    bl: "sm:rounded-bl-xl",
    br: "sm:rounded-br-xl",
  },
  lg: {
    reset: "lg:rounded-none",
    tl: "lg:rounded-tl-xl",
    tr: "lg:rounded-tr-xl",
    bl: "lg:rounded-bl-xl",
    br: "lg:rounded-br-xl",
  },
} as const

type Breakpoint = keyof typeof CORNERS

/** Which of the four frame corners this cell occupies in a grid of `columns`. */
function cornersAt(breakpoint: Breakpoint, index: number, total: number, columns: number) {
  const set = CORNERS[breakpoint]
  const lastRowStart = Math.floor((total - 1) / columns) * columns
  const classes: string[] = [set.reset]

  if (index === 0) classes.push(set.tl)
  if (index === Math.min(columns, total) - 1) classes.push(set.tr)
  if (index === lastRowStart) classes.push(set.bl)
  if (index === total - 1) classes.push(set.br)

  return classes.join(" ")
}

/**
 * Corner classes for one cell of a seam grid, across all three breakpoints.
 *
 * Exported because a seam grid is not always a `SeamGrid`: a `<dl>` needs its
 * own div-per-pair structure and an `<ol>` its own list semantics, and those
 * still have to round the same four corners. Pass the column count in effect at
 * each breakpoint.
 */
export function seamCorners(
  index: number,
  total: number,
  columns: { base?: number; sm?: number; lg?: number },
) {
  return [
    cornersAt("base", index, total, columns.base ?? 1),
    cornersAt("sm", index, total, columns.sm ?? columns.base ?? 1),
    cornersAt("lg", index, total, columns.lg ?? columns.sm ?? columns.base ?? 1),
  ].join(" ")
}

export function SeamGrid({ as: Component = "div", children, className, columns = 4, ...props }: SeamGridProps) {
  const cells = Children.toArray(children).filter(isValidElement) as ReactElement<{ className?: string }>[]
  const total = cells.length
  const smColumns = Math.min(columns, 2)

  return (
    <Component
      className={cn(
        "m-0 grid list-none gap-px rounded-xl bg-seam p-0 ring-1 ring-inset ring-edge",
        COLUMN_STYLES[columns],
        className,
      )}
      {...props}
    >
      {cells.map((cell, index) =>
        cloneElement(cell, {
          key: cell.key ?? index,
          className: cn(
            "min-w-0 bg-surface p-5 transition duration-normal ease-standard",
            "hover:relative hover:z-[1] hover:bg-surface-raised hover:shadow-hover",
            seamCorners(index, total, { base: 1, sm: smColumns, lg: columns }),
            cell.props.className,
          ),
        }),
      )}
    </Component>
  )
}

export interface SeamCellProps {
  children?: ReactNode
  className?: string
}

/**
 * A cell's own contents are its business — SeamGrid only owns the surface, the
 * padding and the corners. This is a plain passthrough so `SeamGrid` has
 * something to clone when a caller has no wrapper of their own.
 */
export function SeamCell({ children, className }: SeamCellProps) {
  return <div className={className}>{children}</div>
}
