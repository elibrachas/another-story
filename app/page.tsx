import { getStories, getAllTags, getCommentCountsForStories } from "@/lib/supabase-server"
import { StoryCard } from "@/components/story-card"
import { Button } from "@/components/ui/button"
import { PlusCircle, TagIcon } from "lucide-react"
import Link from "next/link"
import { TagBadge } from "@/components/tag-badge"
import { PendingSubmissionRedirect } from "@/components/pending-submission-redirect"
import { AlcaparraBanner } from "@/components/alcaparra-banner"
import { StoryPagination } from "@/components/story-pagination"

// Forzar que esta ruta sea dinámica para evitar errores con cookies
export const dynamic = "force-dynamic"

const STORIES_PER_PAGE = 12

interface HomeProps {
  searchParams: Promise<{ page?: string; sort?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1)
  const sortBy = params.sort === "top" ? "top" : "latest"

  // Obtener historias paginadas y etiquetas
  const { stories, totalCount } = await getStories(currentPage, STORIES_PER_PAGE, undefined, undefined, sortBy)
  const { tags } = await getAllTags()

  const totalPages = Math.ceil(totalCount / STORIES_PER_PAGE)

  // Obtener conteo de comentarios para las historias de esta página
  const storyIds = (stories || []).map((story) => story.id)
  const commentCounts = await getCommentCountsForStories(storyIds)

  return (
    <div className="space-y-8">
      <PendingSubmissionRedirect />
      <section className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Crónicas Laborales</h1>
          <Link href="/submit">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Comparte tu Historia
            </Button>
          </Link>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Experiencias reales sobre ambientes laborales. Lee, aprende y sabe que no estás solo.
        </p>
      </section>

      {tags && tags.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <TagIcon className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground">Explorar por etiquetas</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        </section>
      )}

      {/* Sort tabs as links for SEO */}
      <div className="flex items-center gap-2">
        <Link
          href={`/?sort=latest`}
          className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            sortBy === "latest"
              ? "bg-background text-foreground shadow-sm border"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          Más Recientes
        </Link>
        <Link
          href={`/?sort=top`}
          className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            sortBy === "top"
              ? "bg-background text-foreground shadow-sm border"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          Más Populares
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {currentPage === 1 && <AlcaparraBanner />}
        {stories && stories.length > 0 ? (
          stories.map((story) => (
            <StoryCard key={story.id} story={story} commentCount={commentCounts[story.id] || 0} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No hay historias publicadas aún. ¡Sé el primero en compartir!</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <StoryPagination
          currentPage={currentPage}
          totalPages={totalPages}
          sortBy={sortBy}
        />
      )}
    </div>
  )
}
