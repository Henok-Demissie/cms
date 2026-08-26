/**
 * Locales the dashboard offers. Mirrors the values stored in `language`.
 *
 * `short` is what the segmented picker shows; `label` is for prose and detail rows.
 */
export const SUPPORTED_LANGUAGES = [
  { value: "EN", short: "English", label: "English", description: "Use English across the dashboard." },
  { value: "AM", short: "አማርኛ", label: "አማርኛ (Amharic)", description: "በአማርኛ ቋንቋ ይጠቀሙ።" },
] as const

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["value"]

export const DEFAULT_LANGUAGE: LanguageCode = "AM"

export function isSupportedLanguage(value: unknown): value is LanguageCode {
  return SUPPORTED_LANGUAGES.some((entry) => entry.value === value)
}

/** Human-readable name for a stored `language` value, tolerant of legacy/empty data. */
export function languageLabel(value: string | null | undefined) {
  return SUPPORTED_LANGUAGES.find((entry) => entry.value === value)?.label ?? value ?? "Not set"
}
