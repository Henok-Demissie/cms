"use client"

import { useState, useTransition } from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { updateLanguage } from "@/app/dashboard/settings/actions"
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/lib/languages"
import { cn } from "@/lib/utils"

/**
 * Locale picker that saves on selection. The choice is persisted to the account's
 * `language` field; dashboard copy itself is not translated yet.
 *
 * A segmented pill rather than two description cards: the two language names are
 * the whole choice, so nothing needs a heading or a sentence of explanation.
 * Radix keeps the radio roles and arrow-key handling that plain buttons lack.
 */
export function LanguageSetting({
  defaultValue,
  className,
}: {
  defaultValue: LanguageCode
  className?: string
}) {
  const [value, setValue] = useState<LanguageCode>(defaultValue)
  const [pending, startTransition] = useTransition()

  function handleChange(next: string) {
    const previous = value
    setValue(next as LanguageCode)

    startTransition(async () => {
      const result = await updateLanguage(next)
      if (result.ok) {
        toast.success(result.message ?? "Language preference saved")
      } else {
        // Roll the radio back so the UI keeps matching what is actually stored.
        setValue(previous)
        toast.error(result.error)
      }
    })
  }

  return (
    <RadioGroupPrimitive.Root
      value={value}
      onValueChange={handleChange}
      disabled={pending}
      // The visible heading is gone, so the group needs its name from here.
      aria-label="Language"
      className={cn(
        "grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted/40 p-1",
        className,
      )}
    >
      {SUPPORTED_LANGUAGES.map((language) => {
        const active = value === language.value
        return (
          <RadioGroupPrimitive.Item
            key={language.value}
            value={language.value}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5",
              // 13px rather than 12: Amharic script needs the extra size to stay
              // legible, and the unselected side needs real contrast to be read
              // as a choice rather than as disabled.
              "text-[13px] font-medium outline-none transition-colors",
              "focus-visible:ring-2 focus-visible:ring-ring/50",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-foreground/70 hover:text-foreground",
              pending && "cursor-progress",
            )}
          >
            {language.short}
            {active && pending && <Loader2 className="h-3 w-3 animate-spin" />}
          </RadioGroupPrimitive.Item>
        )
      })}
    </RadioGroupPrimitive.Root>
  )
}
