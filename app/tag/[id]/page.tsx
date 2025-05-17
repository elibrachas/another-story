import { getStoriesByTag, getAllTags, getCommentCountsForStories } from "@/lib/supabase-server"
import { StoryCard } from "@/components/story-card"
import { Button } from "@/components/ui/button"
import { TagBadge } from "@/components/tag-badge"
import { ArrowLeft, TagIcon } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export const revalidate = 60 // Revalidar cada minuto

export default async function TagPage({ params }: { params: { id: string } }) {
  const tagId = params.id
  const stories = await getStoriesByTag(tagId)
  const allTags = await getAllTags()

  // Obtener conteo de comentarios para todas las historias
  const storyIds = stories.map((story) => story.id)
  const commentCounts = await getCommentCountsForStories(storyIds)

  // Encontrar la etiqueta actual
  const currentTag = allTags.find((tag) => tag.id === tagId)

  if (!currentTag) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Historias sobre {currentTag.name}</h1>
      </div>

      {stories.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} commentCount={commentCounts[story.id] || 0} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay historias publicadas con esta etiqueta.</p>
          <Link href="/">
            <Button variant="outline" className="mt-4">
              Ver todas las historias
            </Button>
          </Link>
        </div>
      )}

      {allTags.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <TagIcon className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground">Otras etiquetas</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags
              .filter((tag) => tag.id !== tagId)
              .map((tag) => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
          </div>
        </section>
      )}
    </div>
  )
}
