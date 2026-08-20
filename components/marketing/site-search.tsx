"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Search } from "lucide-react"

import { filterSearchItems, type SearchItem } from "@/lib/site-search"
import { cn } from "@/lib/utils"

type SiteSearchProps = {
  placeholder?: string
  className?: string
  onNavigate: (targetId: string) => void
}

export function SiteSearch({ placeholder = "Search...", className, onNavigate }: SiteSearchProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => filterSearchItems(query), [query])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (item: SearchItem) => {
    setQuery("")
    setIsOpen(false)
    onNavigate(item.target)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (results.length > 0) {
      handleSelect(results[0])
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form onSubmit={handleSubmit}>
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          aria-label="Search site sections"
          className="h-9 w-full rounded-full border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </form>

      {isOpen && query.trim() && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          {results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">No results found.</p>
          ) : (
            <ul className="max-h-56 overflow-y-auto py-1">
              {results.map((item) => (
                <li key={item.target}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="flex w-full px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
