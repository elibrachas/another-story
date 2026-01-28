import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TagBadge } from "@/components/tag-badge"
import { CountryFlag } from "@/components/country-flag"
import { MessageSquare } from "lucide-react"
import { UpvoteButton } from "@/components/upvote-button"
import type { Story } from "@/lib/types"
import Image from "next/image"

interface StoryCardProps {
  story: Story
  showExcerpt?: boolean
  commentCount?: number
}

export function StoryCard({ story, showExcerpt = true, commentCount = 0 }: StoryCardProps) {
  const date = new Date(story.created_at)

  // Formatear la fecha sin "alrededor"
  let timeAgo = formatDistanceToNow(date, { addSuffix: true, locale: es })
  timeAgo = timeAgo.replace("alrededor de ", "")

  // Limitar el título a 100 caracteres
  const truncatedTitle = story.title.length > 100 ? `${story.title.substring(0, 100)}...` : story.title

  // Crear un extracto del contenido si existe
  const excerpt =
    story.content && showExcerpt ? `${story.content.substring(0, 150)}${story.content.length > 150 ? "..." : ""}` : null

  // Generar un color basado en el nombre de usuario para el avatar
  const getUserColor = (userId: string) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ]
    const index = userId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return colors[index]
  }

  const userColor = getUserColor(story.user_id || "anonymous")
  const isTelegramUser = story.author === "Telegram"

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <Link href={`/story/${story.id}`} className="group">
          <h3 className="text-xl font-semibold group-hover:text-purple-600 transition-colors">{truncatedTitle}</h3>
        </Link>
      </CardHeader>

      {excerpt && (
        <CardContent className="py-2 flex-grow">
          <p className="text-gray-600 dark:text-gray-300">{excerpt}</p>
        </CardContent>
      )}

      <CardFooter className="pt-2 flex flex-col items-start gap-2">
        {/* Tags section */}
        {story.tags && story.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {story.tags.map((tag) => (
              <TagBadge key={typeof tag === "object" ? tag.id : tag} tag={tag} />
            ))}
          </div>
        )}

        {/* Author and metadata section */}
        <div className="flex flex-wrap items-center justify-between w-full text-sm text-gray-500 gap-y-2">
          {/* Author info */}
          <div className="flex items-center gap-2 min-w-[180px]">
            {isTelegramUser ? (
              <div className="h-6 w-6 rounded-full overflow-hidden bg-white flex items-center justify-center border border-gray-200">
                <Image
                  src="/images/telegram-logo.png"
                  alt="Telegram"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
            ) : (
              <Avatar className={`h-6 w-6 ${userColor} text-white`}>
                <AvatarFallback>{(story.author || "A").substring(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
            )}
            <span className="font-medium">{story.author || "Anónimo"}</span>
            <span className="text-gray-400">·</span>
            <span>{timeAgo}</span>
          </div>

          {/* Industry and country */}
          <div className="flex items-center gap-2 ml-auto">
            {story.industry && (
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-700">
                {story.industry}
              </span>
            )}
            {story.country && <CountryFlag countryCode={story.country} className="ml-1" />}
          </div>
        </div>

        {/* Upvotes and comments section */}
        <div className="flex items-center justify-between w-full mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4">
            {/* Upvote button */}
            <UpvoteButton storyId={story.id} initialUpvotes={story.upvotes || 0} />

            {/* Comments count - only show if there are comments */}
            {commentCount > 0 && (
              <Link
                href={`/story/${story.id}#comments`}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{commentCount}</span>
              </Link>
            )}
          </div>

          {/* Link to full story */}
          <Link href={`/story/${story.id}`} className="text-xs text-purple-600 hover:text-purple-800 font-medium">
            Leer más
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
