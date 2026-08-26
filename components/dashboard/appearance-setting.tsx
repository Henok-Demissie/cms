"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

/**
 * Day/night switch for the dashboard. next-themes is configured with
 * `enableSystem={false}`, so the only two states are "light" and "dark".
 */
export function AppearanceSetting() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // The stored theme is not known until the client hydrates, so hold the switch
  // in a disabled placeholder state until then to avoid a flipping thumb.
  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted ? resolvedTheme === "dark" : true

  return (
    // A bare row: the icon, the label and the switch already say what this is, so
    // it needs no heading of its own in either the account menu or the settings page.
    <div className="flex items-center justify-between gap-4 py-0.5">
      <Label
        htmlFor="appearance-mode"
        className="flex cursor-pointer items-center gap-2.5 text-sm font-medium"
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Sun className="h-4 w-4 text-muted-foreground" />
        )}
        {/* Tinted while night mode is on, so the row reads as active at a glance. */}
        <span className={cn(isDark ? "text-primary" : "text-foreground")}>
          {isDark ? "Night Mode" : "Day Mode"}
        </span>
      </Label>
      <Switch
        id="appearance-mode"
        size="lg"
        checked={isDark}
        disabled={!mounted}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
      />
    </div>
  )
}
