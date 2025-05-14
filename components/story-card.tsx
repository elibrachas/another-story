import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TagBadge } from "@/components/tag-badge"
import { CountryFlag } from "@/components/country-flag"
import type { Story } from "@/lib/types"

interface StoryCardProps {
  story: Story
  showExcerpt?: boolean
}

export function StoryCard({ story, showExcerpt = true }: StoryCardProps) {
  const date = new Date(story.created_at)

  // Formatear la fecha sin "alrededor"
  let timeAgo = formatDistanceToNow(date, { addSuffix: true, locale: es })

  // Eliminar la palabra "alrededor" del resultado
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

        {/* Author and metadata section - improved layout */}
        <div className="flex flex-wrap items-center justify-between w-full text-sm text-gray-500 gap-y-2">
          {/* Author info */}
          <div className="flex items-center gap-2 min-w-[180px]">
            <Avatar className={`h-6 w-6 ${userColor} text-white`}>
              <AvatarFallback>{(story.author || "A").substring(0, 1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{story.author || "Anónimo"}</span>
            <span className="text-gray-400">·</span>
            <span>{timeAgo}</span>
          </div>

          {/* Industry and country */}
          <div className="flex items-center gap-2 ml-auto">
            {story.industry && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-xs">{story.industry}</span>
            )}
            {story.country && <CountryFlag countryCode={story.country} className="ml-1" />}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
