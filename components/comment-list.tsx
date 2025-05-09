import type { Comment } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { CommentUpvoteButton } from "./comment-upvote-button"

export function CommentList({ comments, storyId }: { comments: Comment[]; storyId: string }) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No hay comentarios aún. ¡Sé el primero en compartir tus pensamientos!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="border rounded-lg p-4">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                {comment.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium">{comment.author}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: es })}
                </div>
              </div>
            </div>
            <CommentUpvoteButton commentId={comment.id} initialUpvotes={comment.upvotes} storyId={storyId} />
          </div>
          <div className="mt-2">{comment.content}</div>
        </div>
      ))}
    </div>
  )
}
