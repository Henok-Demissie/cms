/** Sizes offered by the per-page control next to the pager. */
export const PER_PAGE_OPTIONS = [10, 20, 50, 100]

export const DEFAULT_PER_PAGE = 10

/** The slice of a page's `searchParams` that the pager and the search box own. */
export type PageSearchParams = {
  page?: string | string[]
  perPage?: string | string[]
  q?: string | string[]
}

export type Pagination = {
  page: number
  perPage: number
  pageCount: number
  total: number
  /** Ready to spread into a Prisma query. */
  skip: number
  take: number
}

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

/** Reads ?page and ?perPage, falling back to the defaults for anything unexpected. */
export function readPageParams(params: PageSearchParams) {
  const page = Number(firstValue(params.page))
  const perPage = Number(firstValue(params.perPage))

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    perPage: PER_PAGE_OPTIONS.includes(perPage) ? perPage : DEFAULT_PER_PAGE,
  }
}

/**
 * Turns a row count and the requested page into query offsets. The page is
 * clamped, so a hand-edited ?page=99 lands on the last page of results rather
 * than an empty list.
 */
export function paginate(
  total: number,
  { page, perPage }: { page: number; perPage: number },
): Pagination {
  const pageCount = Math.max(1, Math.ceil(total / perPage))
  const current = Math.min(page, pageCount)

  return {
    page: current,
    perPage,
    pageCount,
    total,
    skip: (current - 1) * perPage,
    take: perPage,
  }
}

/** Reads ?q, treating a blank or whitespace-only term as no search at all. */
export function readSearchQuery(params: PageSearchParams) {
  const query = firstValue(params.q)?.trim()
  return query ? query : undefined
}

/**
 * Builds a case-insensitive "any of these columns contains the term" filter.
 *
 * Returns undefined when there is no term, so it can be spread into an `AND`.
 */
export function searchFilter<Field extends string>(
  query: string | undefined,
  fields: readonly Field[],
) {
  if (!query) return undefined
  return {
    OR: fields.map((field) => ({
      // Postgres LIKE is case-sensitive, so the mode is what makes searching
      // for "billing" find "Billing dispute".
      [field]: { contains: query, mode: "insensitive" as const },
    })),
  }
}
