"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  /** "lg" is the chunkier pill used by the day/night row. */
  size?: "default" | "lg"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none",
        size === "lg" ? "h-6 w-10" : "h-5 w-9",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-primary",
        // --input is lighter than --background in the light palette, so an
        // unchecked track filled with it disappears; --border is the mid grey.
        "data-[state=unchecked]:bg-border dark:data-[state=unchecked]:bg-input",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // A white knob in both themes: it has to read against the tinted
          // track when on and against the grey one when off.
          "pointer-events-none block rounded-full bg-white shadow-sm ring-0 transition-transform",
          size === "lg" ? "size-5" : "size-4",
          "data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
