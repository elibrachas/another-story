import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, ThumbsUp } from "lucide-react"
import { CountryFlag } from "@/components/country-flag"
import { TagBadge } from "@/components/tag-badge"
import type { Story } from "@/lib/types"

export function StoryCard({ story }: { story: Story }) {
  const formattedDate = formatDistanceToNow(new Date(story.created_at), {
    addSuffix: true,
    locale: es,
  })

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">
            <Link href={`/story/${story.id}`} className="hover:text-purple-600 transition-colors">
              {story.title}
            </Link>
          </CardTitle>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <span>{story.author}</span>
          <span className="mx-1">•</span>
          <span>{formattedDate}</span>
          {story.country && (
            <>
              <span className="mx-1">•</span>
              <CountryFlag countryCode={story.country} />
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <p className="line-clamp-3 text-muted-foreground">
          {story.content.length > 200 ? `${story.content.substring(0, 200)}...` : story.content}
        </p>
        {story.tags && story.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {story.tags.slice(0, 3).map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
            {story.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{story.tags.length - 3} más</span>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 text-sm text-muted-foreground border-t">
        <div className="flex items-center space-x-4 w-full">
          <div className="flex items-center">
            <ThumbsUp className="h-4 w-4 mr-1" />
            <span>{story.upvotes || 0}</span>
          </div>
          <div className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>0 comentarios</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {story.country && <CountryFlag countryCode={story.country} />}
            <span className="text-xs px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800">{story.industry}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
