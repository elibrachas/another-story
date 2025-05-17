import { getStories, getAllTags, getCommentCountsForStories } from "@/lib/supabase-server"
import { StoryCard } from "@/components/story-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, TagIcon } from "lucide-react"
import Link from "next/link"
import { TagBadge } from "@/components/tag-badge"

// Forzar que esta ruta sea dinámica para evitar errores con cookies
export const dynamic = "force-dynamic"

export default async function Home() {
  // Obtener historias y etiquetas
  const stories = await getStories()
  const tags = await getAllTags()

  // Obtener conteo de comentarios para todas las historias
  const storyIds = stories.map((story) => story.id)
  const commentCounts = await getCommentCountsForStories(storyIds)

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Crónicas Laborales</h1>
          <Link href="/submit">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Comparte tu Historia
            </Button>
          </Link>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Experiencias reales sobre ambientes laborales. Lee, aprende y sabe que no estás solo.
        </p>
      </section>

      {tags.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <TagIcon className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground">Explorar por etiquetas</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        </section>
      )}

      <Tabs defaultValue="latest" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="latest">Más Recientes</TabsTrigger>
            <TabsTrigger value="top">Más Populares</TabsTrigger>
          </TabsList>

          <div className="hidden" id="top-filter">
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Filtrar por período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mes</SelectItem>
                <SelectItem value="all">Todos los tiempos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="latest" className="space-y-4">
          {stories.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {stories
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((story) => (
                  <StoryCard key={story.id} story={story} commentCount={commentCounts[story.id] || 0} />
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay historias publicadas aún. ¡Sé el primero en compartir!</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="top" className="space-y-4">
          {stories.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...stories]
                .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
                .map((story) => (
                  <StoryCard key={story.id} story={story} commentCount={commentCounts[story.id] || 0} />
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay historias publicadas aún. ¡Sé el primero en compartir!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
