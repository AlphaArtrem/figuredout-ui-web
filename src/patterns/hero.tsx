import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "../lib/cn.js"

export interface HeroProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** Actions row. Two calls to action at most; they stay on one line at every width. */
  actions?: ReactNode
  /**
   * A square-ish asset, 1:1 within about 1%. The overlap and the copy offset
   * below are derived from that ratio — a different aspect ratio means
   * recomputing both numbers, not just swapping the file.
   */
  art?: ReactNode
  /** The figures card that rides up over the bottom quarter of the art. */
  card?: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  title: ReactNode
}

export function Hero({ actions, art, card, className, description, eyebrow, title, ...props }: HeroProps) {
  return (
    <header
      className={cn(
        "mx-auto grid max-w-measure items-end px-gut pb-[clamp(2.5rem,5vw,4rem)] pt-[clamp(2rem,4vw,3.25rem)]",
        "gap-x-[clamp(2rem,5vw,4.5rem)]",
        /* Art and card stacked in the left column, words in the right. Source
         * order is art, card, words — the phone's reading order — and the named
         * areas put them back into the laptop's arrangement without duplicating
         * markup or reaching for `order`, which would leave the tab sequence
         * disagreeing with the screen. */
        "grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] grid-rows-[1fr_auto]",
        "[grid-template-areas:'art_copy'_'card_copy']",
        /* On a phone there is no room for two columns, so the art and the words
         * share one cell: the art takes the left of it and the words sit clear
         * of the raised arm, right-aligned so their ragged edge faces away. */
        "max-[880px]:grid-cols-1 max-[880px]:grid-rows-none max-[880px]:items-start",
        "max-[880px]:[grid-template-areas:'stack'_'card']",
        className,
      )}
      {...props}
    >
      {art ? (
        <div
          className={cn(
            "min-w-0 [grid-area:art] [&_img]:block [&_img]:h-auto [&_img]:w-full",
            /* Sized just past the column and pulled left, so only the shoulder
             * is cropped by the viewport — the page needs `overflow-x: clip`
             * for that to be safe. The pull is a fixed length rather than a
             * percentage so the crop stays the same across the range; a
             * percentage keeps widening it after max-width has stopped the art
             * growing. The cap is the half that matters most: unbounded, the
             * art renders over 1000px wide between a large phone and a tablet
             * and dwarfs the headline it is meant to sit beside. */
            "max-[880px]:w-[104%] max-[880px]:max-w-[460px] max-[880px]:-ml-10",
            "max-[880px]:justify-self-start max-[880px]:self-start max-[880px]:[grid-area:stack]",
            /* Artwork that ends in a straight horizontal cut reads as a rule
             * across the page once it hangs from the top, so the last fifth is
             * faded out. */
            "max-[880px]:[mask-image:linear-gradient(to_bottom,#000_78%,transparent_100%)]",
            "max-[880px]:[&_img]:max-w-none",
          )}
        >
          {art}
        </div>
      ) : null}

      {card ? (
        <div
          className={cn(
            "relative z-[1] [grid-area:card]",
            /* The overlap. A negative margin rather than absolute positioning,
             * so the card still occupies its grid row and the header grows to
             * contain it — an absolutely positioned card escapes onto the
             * section below at narrow widths.
             *
             * A percentage margin resolves against the container's WIDTH, which
             * is normally the trap here and is exactly why this works: the art
             * is square, so a quarter of the width is a quarter of its height. */
            "-mt-[25%] max-[880px]:mt-6",
          )}
        >
          {card}
        </div>
      ) : null}

      <div
        className={cn(
          "relative z-[1] min-w-0 [grid-area:copy]",
          /* Dropped below the fist. The offset tracks the PICTURE, not the
           * type: on a square asset the arm sits about 62% of the way down, and
           * 104% × 62% ≈ 64% of the column. The min() freezes it once max-width
           * has stopped the art growing, otherwise the gap keeps opening under
           * a picture that is no longer getting taller. */
          "max-[880px]:pt-[min(64%,300px)] max-[880px]:text-right max-[880px]:[grid-area:stack]",
        )}
      >
        {eyebrow ? (
          <p className="m-0 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-fg-subtle max-[880px]:ml-auto max-[880px]:max-w-[92%]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-3 text-display font-bold tracking-[-0.03em] text-fg [text-wrap:balance] max-[880px]:ml-auto max-[880px]:max-w-[92%]">
          {title}
        </h1>
        {description ? (
          <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-fg-muted max-[880px]:ml-auto max-[880px]:max-w-[92%]">
            {description}
          </p>
        ) : null}
        {actions ? (
          /* Never wraps: dropped onto a second line the two buttons come out
           * different widths, which reads as a primary action and an
           * afterthought. They shrink instead, and match exactly on a phone —
           * `flex-1 basis-0` is what makes them equal, since `flex-1` alone
           * distributes only the spare space. */
          <div className="mt-8 flex flex-nowrap gap-3 max-[880px]:justify-end [&>*]:min-w-0 [&>*]:whitespace-normal max-[620px]:[&>*]:flex-1 max-[620px]:[&>*]:basis-0">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  )
}
