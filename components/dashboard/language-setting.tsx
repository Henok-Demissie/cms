"use client"

import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { updateLanguage } from "@/app/dashboard/settings/actions"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/lib/languages"
import { cn } from "@/lib/utils"

/**
 * Locale picker that saves on selection. The choice is persisted to the account's
 * `language` field; dashboard copy itself is not translated yet.
 */
export function LanguageSetting({ defaultValue }: { defaultValue: LanguageCode }) {
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
    <RadioGroup value={value} onValueChange={handleChange} disabled={pending} className="gap-3">
      {SUPPORTED_LANGUAGES.map((language) => {
        const active = value === language.value
        return (
          <Label
            key={language.value}
            htmlFor={`language-${language.value}`}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors",
              "hover:bg-accent/40",
              active && "border-primary/50 bg-primary/5",
              pending && "cursor-progress opacity-70",
            )}
          >
            <RadioGroupItem value={language.value} id={`language-${language.value}`} className="mt-0.5" />
            <span className="grid gap-0.5">
              <span className="flex items-center gap-2 text-sm font-medium leading-none">
                {language.label}
                {active && pending && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
              </span>
              <span className="text-xs font-normal text-muted-foreground">{language.description}</span>
            </span>
          </Label>
        )
      })}
    </RadioGroup>
  )
}
