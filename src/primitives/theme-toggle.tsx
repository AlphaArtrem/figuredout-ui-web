"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "../icons/index.js"
import { IconButton } from "./button.js"

type ResolvedTheme = "light" | "dark"

const LABEL: Record<ResolvedTheme, string> = { light: "Light", dark: "Dark" }
const ICON = { light: Sun, dark: Moon }

/* ONE_PRESS_TWO_THEMES — what this control does, and why it no longer cycles.
 *
 * It used to cycle system → light → dark and show the current step's name. Two
 * things were wrong with that. From "system" on a light device, the first press
 * chose "light": nothing on screen changed, so switching looked like it took two
 * presses. And "system" is not a theme anyone looks at — it is where a visitor
 * starts, not a place to go back to.
 *
 * So the control toggles between the two themes a person can see. It reads
 * `resolvedTheme`, so a visitor who has never touched it gets their device's
 * setting (the consumer's `ThemeProvider` keeps `defaultTheme="system"`), and the
 * first press always lands on the other one and stores it.
 *
 * NAME_IS_THE_ACTION still holds: the icon shows the theme on screen, and the
 * accessible name says what a press will do ("Switch to dark theme"). The new
 * state is announced through a `role="status"` region that is a SIBLING of the
 * button, so it never joins the name. It starts empty, so mounting announces
 * nothing, and only a press fills it. `aria-pressed` stays off: a pressed dark
 * mode would read as "dark mode, on" while the label reads as an action. */
export function ThemeToggle({ size = "md" }: { size?: "sm" | "md" } = {}) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [announcement, setAnnouncement] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  // The theme is unknown until the client has read storage and the media query;
  // a placeholder the button's size keeps the bar from shifting when it appears.
  if (!mounted) {
    return <div className={size === "sm" ? "h-9 w-9 rounded-sm" : "h-11 w-11 rounded-md"} aria-hidden="true" />
  }

  const current: ResolvedTheme = resolvedTheme === "dark" ? "dark" : "light"
  const next: ResolvedTheme = current === "dark" ? "light" : "dark"
  const Icon = ICON[current]

  return (
    <>
      <IconButton
        variant="ghost"
        size={size}
        icon={<Icon size={size === "sm" ? 16 : 20} aria-hidden="true" />}
        onClick={() => {
          setTheme(next)
          setAnnouncement(`Theme set to ${LABEL[next].toLowerCase()}.`)
        }}
        aria-label={`Switch to ${LABEL[next].toLowerCase()} theme`}
        title={`Switch to ${LABEL[next].toLowerCase()} theme`}
      />
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </>
  )
}
