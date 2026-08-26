"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Loader2, Search, X } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Search box for the dashboard lists. The term lives in ?q so the server
 * component does the filtering — which keeps it working across pagination and
 * survives a reload or a shared link.
 */
export function ListSearch({
  placeholder = "Search…",
  className,
}: {
  placeholder?: string
  className?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const current = searchParams.get("q") ?? ""
  const [value, setValue] = useState(current)
  const inputRef = useRef<HTMLInputElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Follow the URL when it changes from the outside (back/forward, a reset
  // link), but never while the box has focus or it would eat what is being
  // typed as each debounced navigation lands.
  useEffect(() => {
    if (document.activeElement !== inputRef.current) setValue(current)
  }, [current])

  useEffect(() => () => clearTimeout(timer.current), [])

  /** Keeps unrelated params, drops ?page: a new term restarts the result set. */
  function hrefFor(term: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("page")
    if (term.trim()) params.set("q", term.trim())
    else params.delete("q")
    const query = params.toString()
    return query ? `${pathname}?${query}` : pathname
  }

  function navigate(term: string) {
    clearTimeout(timer.current)
    startTransition(() => router.replace(hrefFor(term), { scroll: false }))
  }

  function handleChange(term: string) {
    setValue(term)
    clearTimeout(timer.current)
    // Long enough that typing a word is one navigation, short enough to feel live.
    timer.current = setTimeout(() => navigate(term), 350)
  }

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        navigate(value)
      }}
      className={cn(
        "flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3",
        "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/40",
        className,
      )}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted-foreground" />
      ) : (
        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      )}
      <input
        ref={inputRef}
        type="search"
        name="q"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setValue("")
            navigate("")
          }
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        // The native clear affordance duplicates the button below it.
        className="w-full min-w-0 bg-transparent text-xs outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setValue("")
            navigate("")
            inputRef.current?.focus()
          }}
          className="grid h-5 w-5 shrink-0 place-items-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </form>
  )
}
