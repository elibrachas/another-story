"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { CommentUpvoteButton } from "./comment-upvote-button"
import { getCommentsByStoryIdClient } from "@/lib/supabase-client"
import { sanitizeText } from "@/lib/sanitize"
import type { Comment } from "@/lib/types"

export function CommentList({ storyId }: { storyId: string }) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadComments() {
      try {
        setLoading(true)
        const commentsData = await getCommentsByStoryIdClient(storyId)
        setComments(commentsData)
      } catch (error) {
        console.error("Error loading comments:", error)
      } finally {
        setLoading(false)
      }
    }

    loadComments()
  }, [storyId])

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-2 text-sm text-muted-foreground">Cargando comentarios...</p>
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No hay comentarios aún. ¡Sé el primero en compartir tus pensamientos!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        // Sanitizar el contenido del comentario
        const safeContent = sanitizeText(comment.content)
        // Sanitizar el nombre del autor
        const safeAuthorName = sanitizeText(comment.display_name || comment.author || "Anónimo")

        return (
          <div key={comment.id} className="border rounded-lg p-4">
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                  {safeAuthorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{safeAuthorName}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: es })}
                  </div>
                </div>
              </div>
              <CommentUpvoteButton commentId={comment.id} initialUpvotes={comment.upvotes} storyId={storyId} />
            </div>
            <div className="mt-2">{safeContent}</div>
          </div>
        )
      })}
    </div>
  )
}
