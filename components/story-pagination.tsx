import Link from "next/link"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface StoryPaginationProps {
  currentPage: number
  totalPages: number
  sortBy: string
  basePath?: string
}

function buildHref(page: number, sortBy: string, basePath: string) {
  const params = new URLSearchParams()
  if (page > 1) params.set("page", String(page))
  if (sortBy !== "latest") params.set("sort", sortBy)
  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

function getVisiblePages(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | "ellipsis")[] = [1]

  if (currentPage > 3) {
    pages.push("ellipsis")
  }

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis")
  }

  pages.push(totalPages)

  return pages
}

export function StoryPagination({ currentPage, totalPages, sortBy, basePath = "/" }: StoryPaginationProps) {
  const visiblePages = getVisiblePages(currentPage, totalPages)

  return (
    <Pagination>
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <Link href={buildHref(currentPage - 1, sortBy, basePath)} aria-label="Ir a la página anterior">
              <PaginationPrevious />
            </Link>
          </PaginationItem>
        )}

        {visiblePages.map((page, i) =>
          page === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <Link href={buildHref(page, sortBy, basePath)}>
                <PaginationLink isActive={page === currentPage}>
                  {page}
                </PaginationLink>
              </Link>
            </PaginationItem>
          )
        )}

        {currentPage < totalPages && (
          <PaginationItem>
            <Link href={buildHref(currentPage + 1, sortBy, basePath)} aria-label="Ir a la siguiente página">
              <PaginationNext />
            </Link>
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  )
}
