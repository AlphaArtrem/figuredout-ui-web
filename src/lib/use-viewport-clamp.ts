"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import type { MutableRefObject } from "react"

/** Clearance kept between a floating element and the edge of the screen. */
export const VIEWPORT_GUTTER = 8

/* The measurement has to land before the browser paints, or the element is drawn
 * off-screen for a frame and then jumps. Floating elements only open from a
 * pointer or focus, so this never runs while rendering on the server. */
const useMeasureEffect = typeof window === "undefined" ? useEffect : useLayoutEffect

/**
 * Slides a floating element back inside the viewport once it is up.
 *
 * Anchoring — which edge a menu hangs from, whether a tooltip is centred — is
 * the right call for the common case and wrong at the edges of the screen: an
 * end-aligned menu on a trigger near the left of a phone runs off it, and a
 * centred tooltip on a control near either edge runs off that. Anchoring stays
 * the intent; this gives the viewport the final say.
 *
 * Apply `shift` to a WRAPPER, never to the floating element itself. These
 * elements animate or transition their own `transform`, and a running animation
 * beats an inline style on the same property — the shift would be computed
 * correctly and then quietly ignored.
 */
export function useViewportClamp<T extends HTMLElement>(active: boolean): {
  ref: MutableRefObject<T | null>
  shift: number
} {
  const ref = useRef<T | null>(null)
  const [shift, setShift] = useState(0)

  useMeasureEffect(() => {
    if (!active) {
      setShift(0)
      return
    }

    const clampIntoViewport = () => {
      const element = ref.current
      if (!element) {
        return
      }

      /* The rect already includes whatever shift is applied, so the correction
       * is relative: apply it and the next measurement reads zero. */
      const rect = element.getBoundingClientRect()
      const pastLeft = VIEWPORT_GUTTER - rect.left
      const pastRight = rect.right - (window.innerWidth - VIEWPORT_GUTTER)

      /* Left wins when the element is too wide for the viewport to hold:
       * reading starts at the leading edge, so that is the end to keep. */
      const correction = pastLeft > 0 ? pastLeft : pastRight > 0 ? -pastRight : 0
      if (correction !== 0) {
        setShift((current) => current + correction)
      }
    }

    clampIntoViewport()
    window.addEventListener("resize", clampIntoViewport)
    return () => window.removeEventListener("resize", clampIntoViewport)
  }, [active])

  return { ref, shift }
}
