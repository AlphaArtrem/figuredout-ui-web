"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"

/* LOADING_CONVENTION — how this package says "a read is running".
 *
 * `Skeleton` is `aria-hidden="true"` and stays that way: a shimmering box is a
 * decoration, not content. That is correct on its own and it is also why a page
 * built out of skeletons is completely silent — nothing tells a screen reader
 * that content is coming, and nothing tells it that content arrived.
 *
 * This is `Button`'s PENDING_CONVENTION (see `button.tsx`) applied to a *block*
 * rather than a control. The same three parts:
 *
 *   1. the spinning/shimmering glyph, `aria-hidden` — that is `Skeleton`;
 *   2. `aria-busy="true"` on the element that is busy — that is this wrapper;
 *   3. a `role="status"` node carrying `sr-only` text, mounted at the moment
 *      the work starts — that is the span this renders first.
 *
 * Two things about the status node are deliberate and are the whole reason this
 * is a component and not three attributes copied into twelve files:
 *
 * **It is a sibling of the content, never a wrapper around it.** A live region
 * announces everything added inside it, so a `role="status"` wrapped around a
 * table would read the entire table aloud on arrival. The region is a one-line
 * `sr-only` span and the content sits beside it.
 *
 * **It mounts empty and is filled by an effect.** A live region that already
 * has its text when it enters the DOM is not reliably announced — the region
 * has to exist before the text lands in it. The effect is what guarantees the
 * announcement fires at all, and it is also what makes the *arrival* announce:
 * the text goes "" → "Loading leads" → "Leads loaded", two changes, one per
 * transition. A parent that re-renders four times writes the same string four
 * times, React leaves the text node alone, and nothing is re-announced.
 *
 * Announcing arrival is the half that matters. A region that only says
 * "Loading…" and then falls silent tells a reader nothing about when to look
 * again; the table simply appears in a DOM nobody was told to re-read. */

/**
 * True when an ancestor `LoadingRegion` is already announcing for this subtree.
 *
 * Seven regions announcing at once is worse than none, and the pages that
 * needed this most are exactly the ones that render several loading blocks:
 * `/inbox` mounts three lists, `/analytics` seven panels, `/config/billing` a
 * plan card and a usage meter. Rather than asking every shared component to
 * know whether it happens to be the whole page today, a nested region renders
 * its children and nothing else — one announcement per page, wherever the
 * components compose.
 *
 * The outermost region therefore has to be given the *combined* pending state
 * of the reads underneath it. That is the one obligation this hands the caller.
 */
const LoadingRegionContext = createContext(false)

export interface LoadingRegionProps {
  /** The block being replaced while the read is in flight — skeletons and all. */
  children: ReactNode
  className?: string
  /**
   * The read has failed or been paused, so nothing is coming. Suppresses both
   * `aria-busy` and every announcement: a settled failure must not leave a
   * region claiming to be loading, and it must not claim to have loaded either.
   * The failure has its own `role="alert"` to speak with.
   */
  failed?: boolean
  /**
   * What is being loaded, as a whole sentence: "Loading leads", "Loading your
   * analytics". Not a subject the component wraps in hardcoded English — the
   * caller owns the wording, as it does for `Button`'s `loadingLabel`.
   */
  label: string
  /** Whether the read is in flight. */
  loading: boolean
  /**
   * What arrival sounds like. Defaults to a bare "Loaded", which is enough when
   * the region covers the page; pass something specific ("Leads loaded") when
   * it does not.
   */
  loadedLabel?: string
}

export function LoadingRegion({
  children,
  className,
  failed = false,
  label,
  loadedLabel = "Loaded",
  loading,
}: LoadingRegionProps) {
  const nested = useContext(LoadingRegionContext)

  if (nested) {
    return <div className={className}>{children}</div>
  }

  return (
    <OwningLoadingRegion
      className={className}
      failed={failed}
      label={label}
      loadedLabel={loadedLabel}
      loading={loading}
    >
      {children}
    </OwningLoadingRegion>
  )
}

/* Split out so the hooks below only ever run in the region that owns the
 * announcement. A nested region has no state to keep and no effect to fire. */
function OwningLoadingRegion({
  children,
  className,
  failed,
  label,
  loadedLabel,
  loading,
}: Required<Omit<LoadingRegionProps, "className">> & { className?: string | undefined }) {
  const [announcement, setAnnouncement] = useState("")
  /* Arrival is only worth announcing to somebody who heard the departure. A
   * screen that mounts with its data already in the query cache never said
   * "Loading", so it must not say "Loaded" either. */
  const wasLoading = useRef(false)

  useEffect(() => {
    if (failed) {
      setAnnouncement("")
      return
    }
    if (loading) {
      wasLoading.current = true
      setAnnouncement(label)
      return
    }
    setAnnouncement(wasLoading.current ? loadedLabel : "")
  }, [failed, label, loadedLabel, loading])

  const busy = loading && !failed

  return (
    <LoadingRegionContext.Provider value={true}>
      <div className={className} aria-busy={busy || undefined}>
        <span role="status" aria-live="polite" className="sr-only">
          {announcement}
        </span>
        {children}
      </div>
    </LoadingRegionContext.Provider>
  )
}
