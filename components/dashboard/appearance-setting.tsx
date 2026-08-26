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
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors",
            isDark ? "bg-indigo-500/15 text-indigo-400" : "bg-amber-400/15 text-amber-500",
          )}
        >
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </span>
        <div className="grid gap-0.5">
          <Label htmlFor="appearance-mode" className="cursor-pointer text-sm font-medium">
            {isDark ? "Night mode" : "Day mode"}
          </Label>
          <p className="text-xs text-muted-foreground">
            {isDark ? "Dark surfaces, easier on the eyes at night." : "Bright surfaces for well-lit rooms."}
          </p>
        </div>
      </div>
      <Switch
        id="appearance-mode"
        checked={isDark}
        disabled={!mounted}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
      />
    </div>
  )
}
