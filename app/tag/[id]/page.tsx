import { Button } from "@/components/ui/button"
import { StoryCard } from "@/components/story-card"
import { getStoriesByTag, getAllTags } from "@/lib/supabase-server"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function TagPage({ params }: { params: { id: string } }) {
  const [stories, allTags] = await Promise.all([getStoriesByTag(params.id), getAllTags()])

  const currentTag = allTags.find((tag) => tag.id === params.id)

  if (!currentTag) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Historias con la etiqueta: {currentTag.name}</h1>
      </div>

      {currentTag.description && <p className="text-muted-foreground">{currentTag.description}</p>}

      {stories.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay historias con esta etiqueta aún.</p>
          <Link href="/submit">
            <Button className="mt-4 bg-purple-600 hover:bg-purple-700">Comparte la primera historia</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
