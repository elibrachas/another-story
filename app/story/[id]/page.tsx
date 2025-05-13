"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { UpvoteButton } from "@/components/stories/upvote-button"
import { CommentList } from "@/components/comments/comment-list"
import { CommentForm } from "@/components/comment-form"
import { Separator } from "@/components/ui/separator"
import { TagBadge } from "@/components/stories/tag-badge"
import { getStoryByIdClient, getCommentsByStoryIdClient } from "@/lib/supabase-client"
import type { Story, Comment } from "@/lib/types"

export default function StoryPage({ params }: { params: { id: string } }) {
  const [story, setStory] = useState<Story | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        const storyData = await getStoryByIdClient(params.id)

        if (!storyData) {
          router.push("/404")
          return
        }

        const commentsData = await getCommentsByStoryIdClient(params.id)

        setStory(storyData)
        setComments(commentsData)
      } catch (err) {
        console.error("Error al cargar datos:", err)
        setError("Error al cargar el contenido. Por favor, inténtalo de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-muted-foreground">Cargando historia...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Error al cargar contenido</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
          Reintentar
        </Button>
      </div>
    )
  }

  if (!story) {
    return null
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a historias
        </Button>
      </Link>

      <Card className="overflow-hidden border-purple-500/20">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{story.title}</h1>
              <p className="text-sm text-muted-foreground">
                Publicado {formatDistanceToNow(new Date(story.created_at), { addSuffix: true, locale: es })}
              </p>
            </div>
            <UpvoteButton storyId={story.id} initialUpvotes={story.upvotes} />
          </div>

          {story.tags && story.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {story.tags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
            </div>
          )}

          <div className="prose prose-invert max-w-none story-content">
            {story.content.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <div className="pt-4 border-t flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                {(story.display_name || story.author).charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{story.display_name || story.author}</span>
            </div>
            <div className="text-sm text-muted-foreground">Industria: {story.industry}</div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Comentarios ({comments.length})</h2>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            <CommentForm storyId={story.id} />

            {comments.length > 0 && (
              <>
                <Separator />
                <CommentList comments={comments} storyId={story.id} />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
