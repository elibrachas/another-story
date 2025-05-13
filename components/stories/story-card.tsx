"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
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

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-200">
      <CardContent className="flex-grow p-5">
        <div className="flex justify-between items-start mb-2">
          <Link href={`/story/${story.id}`} className="block">
            <h3 className="text-xl font-semibold line-clamp-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              {story.title}
            </h3>
          </Link>
          <UpvoteButton storyId={story.id} initialUpvotes={story.upvotes || 0} />
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {formatDistanceToNow(new Date(story.created_at), { addSuffix: true, locale: es })}
        </p>
        <p className="line-clamp-3 mb-4">{truncateContent(story.content, 30)}</p>
        {story.tags && story.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto">
            {story.tags.slice(0, 3).map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
            {story.tags.length > 3 && <span className="text-xs text-muted-foreground">+{story.tags.length - 3}</span>}
          </div>
        )}
      </CardContent>
      <CardFooter className="px-5 py-3 border-t flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center text-xs text-white">
            {(story.display_name || story.author).charAt(0).toUpperCase()}
          </div>
          <span className="text-sm">{story.display_name || story.author}</span>
        </div>
        <Link
          href={`/story/${story.id}`}
          className="text-xs font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
        >
          Leer más
        </Link>
      </CardFooter>
    </Card>
  )
}
