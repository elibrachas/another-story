"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { UpvoteButton } from "@/components/upvote-button"
import { TagBadge } from "@/components/tag-badge"
import type { Story } from "@/lib/types"

export function StoryCard({ story }: { story: Story }) {
  return (
    <Card className="overflow-hidden flex flex-col h-full border-purple-500/20 hover:border-purple-500/50 transition-colors">
      <CardHeader className="pb-2">
        <Link href={`/story/${story.id}`}>
          <CardTitle className="line-clamp-2 hover:text-purple-400 transition-colors">{story.title}</CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground line-clamp-3 mb-2">
          {story.excerpt || story.content.substring(0, 120) + "..."}
        </p>

        {story.tags && story.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {story.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground">Industria: {story.industry}</div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 border-t">
        <div className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(story.created_at), { addSuffix: true, locale: es })}
        </div>
        <UpvoteButton storyId={story.id} initialUpvotes={story.upvotes} />
      </CardFooter>
    </Card>
  )
}
