"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { DEFAULT_PER_PAGE, PER_PAGE_OPTIONS, type Pagination } from "@/lib/pagination"
import { cn } from "@/lib/utils"

/**
 * Page buttons to render: always the first and last page, the current page and
 * its neighbours, and a gap wherever the run is broken.
 */
function pageItems(page: number, pageCount: number): Array<number | "gap"> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  const shown = new Set([1, pageCount])
  for (let candidate = page - 1; candidate <= page + 1; candidate++) {
    if (candidate >= 1 && candidate <= pageCount) shown.add(candidate)
  }

  const sorted = [...shown].sort((a, b) => a - b)
  return sorted.flatMap((value, index) =>
    index > 0 && value - sorted[index - 1] > 1 ? ["gap" as const, value] : [value],
  )
}

const stepClassName =
  "grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors"

/**
 * Footer pager for the dashboard lists: a row count on the left, page steppers
 * and a per-page control on the right. Pages are plain links, so the browser's
 * back button and middle-click both behave.
 */
export function ListPagination({
  page,
  perPage,
  pageCount,
  total,
  className,
}: Pick<Pagination, "page" | "perPage" | "pageCount" | "total"> & {
  className?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (total === 0) return null

  /** Keeps any unrelated query params (a search term, a filter) intact. */
  function hrefFor(next: { page?: number; perPage?: number }) {
    const params = new URLSearchParams(searchParams.toString())

    if (next.perPage !== undefined) {
      // A new page size invalidates the old offset, so go back to page one.
      params.delete("page")
      if (next.perPage === DEFAULT_PER_PAGE) params.delete("perPage")
      else params.set("perPage", String(next.perPage))
    }

    if (next.page !== undefined) {
      if (next.page <= 1) params.delete("page")
      else params.set("page", String(next.page))
    }

    const query = params.toString()
    return query ? `${pathname}?${query}` : pathname
  }

  const from = (page - 1) * perPage + 1
  const to = Math.min(page * perPage, total)

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3",
        className,
      )}
    >
      <p className="text-xs text-muted-foreground">
        {`Items ${from} - ${to} of ${total}`}
      </p>

      <div className="flex items-center gap-2">
        <nav aria-label="Pagination" className="flex items-center gap-1">
          {page > 1 ? (
            <Link
              href={hrefFor({ page: page - 1 })}
              aria-label="Previous page"
              className={cn(stepClassName, "hover:bg-accent hover:text-foreground")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
          ) : (
            <span aria-hidden className={cn(stepClassName, "opacity-40")}>
              <ChevronLeft className="h-4 w-4" />
            </span>
          )}

          {pageItems(page, pageCount).map((item, index) =>
            item === "gap" ? (
              <span
                key={`gap-${index}`}
                aria-hidden
                className="grid h-8 w-8 place-items-center text-xs text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Link
                key={item}
                href={hrefFor({ page: item })}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={cn(
                  "grid h-8 min-w-8 place-items-center rounded-md px-2 text-xs font-medium transition-colors",
                  item === page
                    ? "bg-primary/15 text-primary"
                    : "text-foreground hover:bg-accent",
                )}
              >
                {item}
              </Link>
            ),
          )}

          {page < pageCount ? (
            <Link
              href={hrefFor({ page: page + 1 })}
              aria-label="Next page"
              className={cn(stepClassName, "hover:bg-accent hover:text-foreground")}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span aria-hidden className={cn(stepClassName, "opacity-40")}>
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </nav>

        <Select
          value={String(perPage)}
          onValueChange={(value) => router.push(hrefFor({ perPage: Number(value) }))}
        >
          <SelectTrigger size="sm" aria-label="Rows per page" className="gap-1.5 text-xs">
            <span className="text-muted-foreground">Per page:</span>
            <span className="font-medium">{perPage}</span>
          </SelectTrigger>
          <SelectContent align="end">
            {PER_PAGE_OPTIONS.map((option) => (
              <SelectItem key={option} value={String(option)} className="text-xs">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
