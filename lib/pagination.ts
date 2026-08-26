/** Sizes offered by the per-page control next to the pager. */
export const PER_PAGE_OPTIONS = [10, 20, 50, 100]

export const DEFAULT_PER_PAGE = 10

/** The slice of a page's `searchParams` that the pager owns. */
export type PageSearchParams = {
  page?: string | string[]
  perPage?: string | string[]
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
