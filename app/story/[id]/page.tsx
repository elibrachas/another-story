import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getStoryById, getCommentsByStoryId } from "@/lib/supabase-server"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { ArrowLeft, MessageSquare } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { UpvoteButton } from "@/components/upvote-button"
import { CommentList } from "@/components/comment-list"
import { CommentForm } from "@/components/comment-form"
import { Separator } from "@/components/ui/separator"
import { TagBadge } from "@/components/tag-badge"

export default async function StoryPage({ params }: { params: { id: string } }) {
  const story = await getStoryById(params.id)

  if (!story) {
    notFound()
  }

  const comments = await getCommentsByStoryId(params.id)

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

          <div className="prose prose-invert max-w-none">
            {story.content.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <div className="pt-4 border-t flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                {story.author.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{story.author}</span>
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
