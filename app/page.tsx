"use client"

import { useState, useEffect } from "react"
import { StoryCard } from "@/components/story-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, TagIcon } from "lucide-react"
import Link from "next/link"
import { TagBadge } from "@/components/tag-badge"
import { getStoriesClient, getAllTagsClient } from "@/lib/supabase-client"
import type { Story, Tag } from "@/lib/types"

export default function Home() {
  const [stories, setStories] = useState<Story[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        // Cargar historias y etiquetas
        const [storiesData, tagsData] = await Promise.all([getStoriesClient(), getAllTagsClient()])

        // Verificar que solo se muestren historias publicadas
        const publishedStories = storiesData.filter((story) => story.published === true)

        setStories(publishedStories)
        setTags(tagsData)
      } catch (err) {
        console.error("Error al cargar datos:", err)
        setError("Error al cargar el contenido. Por favor, inténtalo de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-muted-foreground">Cargando historias...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Error al cargar contenido</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
          Reintentar
        </Button>
      </div>
    )
  }

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
              <p className="text-muted-foreground">No hay historias publicadas aún. ¡Sé el primero en compartir!</p>
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
              <p className="text-muted-foreground">No hay historias publicadas aún. ¡Sé el primero en compartir!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
