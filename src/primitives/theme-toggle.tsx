"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Desktop, Moon, Sun } from "../icons/index.js"
import { Button } from "./button.js"

type ThemeChoice = "system" | "light" | "dark"

const CYCLE: ThemeChoice[] = ["system", "light", "dark"]

const LABEL: Record<ThemeChoice, string> = { system: "System", light: "Light", dark: "Dark" }
const ICON = { system: Desktop, light: Sun, dark: Moon }

/* NAME_IS_THE_ACTION — how this control says what it is and what it does.
 *
 * A button's accessible name should answer "what happens if I press this",
 * because that is the only thing a user needs before pressing it. This one used
 * to answer "what is the theme right now", twice: the visible label said
 * "System" and an `sr-only` span said "Theme: System", so the name computed to
 * "System Theme: System" and never mentioned that pressing it changes anything.
 *
 * It cycles over three values, so `aria-pressed` is the wrong primitive — that
 * is a two-state control's affordance, and "pressed: false" says nothing about
 * which of the other two you would land on.
 *
 * So: `aria-label` names the action ("Switch to light theme"), and it changes as
 * the cycle advances, which means a user who stays on the control after pressing
 * it hears the next step. The current state is carried by a `role="status"`
 * region that is a SIBLING of the button rather than a child of it — this is
 * phase 03's PENDING_CONVENTION mechanism (an `sr-only` `role="status"` node
 * mounted at the moment something changes), moved outside the button on purpose,
 * because there the whole point was to append to the name and here the whole
 * point is not to be part of it. It starts empty so mounting announces nothing;
 * only a press fills it. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [announcement, setAnnouncement] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-11 w-24 rounded-md bg-surface-raised" aria-hidden="true" />
  }

  const current = (theme ?? "system") as ThemeChoice
  const currentIndex = CYCLE.indexOf(current)
  const next = CYCLE[(currentIndex + 1 + CYCLE.length) % CYCLE.length] ?? "system"
  const Icon = ICON[current]

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        leadingIcon={<Icon size={16} aria-hidden="true" />}
        onClick={() => {
          setTheme(next)
          setAnnouncement(`Theme set to ${LABEL[next].toLowerCase()}.`)
        }}
        aria-label={`Switch to ${LABEL[next].toLowerCase()} theme`}
        title={`Theme: ${LABEL[current]}. Switch to ${LABEL[next].toLowerCase()}.`}
      >
        <span className="hidden sm:inline">{LABEL[current]}</span>
      </Button>
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </>
  )
}
