import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { CommentList } from "@/components/comment-list"
import { CommentForm } from "@/components/comment-form"
import { TagBadge } from "@/components/tag-badge"
import { Separator } from "@/components/ui/separator"
import { UpvoteButton } from "@/components/upvote-button"
import { ConnectionError } from "@/components/connection-error"
import { sanitizeHtml, sanitizeText } from "@/lib/sanitize"

export const dynamic = "force-dynamic"

export default async function StoryPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Obtener la historia
    const { data: story, error } = await supabase
      .from("stories")
      .select(
        `
        *,
        tags:story_tags(
          tag:tags(*)
        )
      `,
      )
      .eq("id", params.id)
      .eq("published", true)
      .single()

    if (error || !story) {
      console.error("Error fetching story:", error)
      notFound()
    }

    // Formatear las etiquetas
    const formattedTags = story.tags
      ? story.tags.map((tagObj: any) => ({
          id: tagObj.tag.id,
          name: tagObj.tag.name,
        }))
      : []

    // Sanitizar el contenido
    const safeTitle = sanitizeText(story.title)
    const safeAuthorName = sanitizeText(story.display_name || story.author || "Anónimo")
    const safeIndustry = sanitizeText(story.industry)

    // Sanitizar y formatear el contenido
    const contentParagraphs = story.content.split("\n\n").map((paragraph: string) => sanitizeHtml(paragraph))

    return (
      <div className="container max-w-4xl py-6 space-y-8">
        <article className="prose prose-purple dark:prose-invert max-w-none">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{safeTitle}</h1>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-6">
            <span>
              Por: {safeAuthorName} • Industria: {safeIndustry}
            </span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(story.created_at), { addSuffix: true, locale: es })}</span>
          </div>

          {formattedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {formattedTags.map((tag: any) => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
            </div>
          )}

          <div className="whitespace-pre-line">
            {contentParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Botón de upvote movido al final de la historia */}
          <div className="flex justify-end mt-8">
            <UpvoteButton storyId={story.id} initialUpvotes={story.upvotes} />
          </div>
        </article>

        <Separator className="my-8" />

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Comentarios</h2>
          <CommentForm storyId={story.id} />
          <CommentList storyId={story.id} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in StoryPage:", error)
    return <ConnectionError />
  }
}
