"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Desktop, Moon, Sun } from "../icons/index.js"
import { Button } from "./button.js"

const CYCLE: Array<"system" | "light" | "dark"> = ["system", "light", "dark"]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-11 w-24 rounded-md bg-surface-raised" aria-hidden="true" />
  }

  const current = (theme ?? "system") as "system" | "light" | "dark"
  const currentIndex = CYCLE.indexOf(current)
  const next = CYCLE[(currentIndex + 1 + CYCLE.length) % CYCLE.length] ?? "system"
  const label = { system: "System", light: "Light", dark: "Dark" }[current]
  const Icon = { system: Desktop, light: Sun, dark: Moon }[current]

  return (
    <Button
      variant="ghost"
      size="sm"
      leadingIcon={<Icon size={16} aria-hidden="true" />}
      onClick={() => setTheme(next)}
      title={`Theme: ${label} (click to change)`}
    >
      <span className="hidden sm:inline">{label}</span>
      <span className="sr-only sm:hidden">Theme: {label}</span>
    </Button>
  )
}
