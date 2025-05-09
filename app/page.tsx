import { StoryCard } from "@/components/story-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, TagIcon } from "lucide-react"
import Link from "next/link"
import { getStories, getAllTags } from "@/lib/supabase-server"
import { TagBadge } from "@/components/tag-badge"

export default async function Home() {
  const [stories, tags] = await Promise.all([getStories(), getAllTags()])

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Historias destacadas</h1>
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

      <Tabs defaultValue="top" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="top">Más Populares</TabsTrigger>
          <TabsTrigger value="latest">Más Recientes</TabsTrigger>
        </TabsList>
        <TabsContent value="top" className="space-y-4">
          {stories.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {stories
                .sort((a, b) => b.upvotes - a.upvotes)
                .map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay historias aún. ¡Sé el primero en compartir!</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="latest" className="space-y-4">
          {stories.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {stories
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay historias aún. ¡Sé el primero en compartir!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
