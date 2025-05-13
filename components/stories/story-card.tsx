"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { TagBadge } from "@/components/stories/tag-badge"
import { UpvoteButton } from "@/components/stories/upvote-button"
import type { Story } from "@/lib/types"

export function StoryCard({ story }: { story: Story }) {
  // Función para truncar el contenido a un número específico de palabras
  const truncateContent = (content: string, wordCount: number) => {
    const words = content.split(" ")
    if (words.length > wordCount) {
      return words.slice(0, wordCount).join(" ") + "..."
    }
    return content
  }

  const formatDate = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <Link href={`/story/${story.id}`}>
          <CardTitle className="text-xl hover:text-purple-600 transition-colors">{story.title}</CardTitle>
        </Link>
        <CardDescription className="flex items-center gap-2 text-sm">
          <span>{formatDate(story.created_at)}</span>
          <span>•</span>
          <span>{story.anonymous ? "Anónimo" : story.author_name || "Usuario"}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="line-clamp-3 text-sm story-content mb-4">{story.content}</div>
        <div className="flex flex-wrap gap-2 mt-2">
          {story.tags?.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2 border-t">
        <div className="flex items-center gap-2">
          <UpvoteButton storyId={story.id} upvotes={story.upvotes || 0} />
        </div>
        <Link
          href={`/story/${story.id}`}
          className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
        >
          Leer más
        </Link>
      </CardFooter>
    </Card>
  )
}
