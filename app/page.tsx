"use client"

import { useState, useEffect } from "react"
import { StoryCard } from "@/components/story-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, TagIcon, AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { TagBadge } from "@/components/tag-badge"
import { getStoriesClient, getAllTagsClient, clearCache } from "@/lib/supabase-client"
import type { Story, Tag } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { OfflineBanner } from "@/components/offline-banner"

export default function Home() {
  const [stories, setStories] = useState<Story[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [popularTimeFilter, setPopularTimeFilter] = useState<"week" | "month" | "all">("all")
  const [activeTab, setActiveTab] = useState<"latest" | "top">("latest")
  const [isRetrying, setIsRetrying] = useState(false)

  const loadData = async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)
      setIsRetrying(forceRefresh)

      if (forceRefresh) {
        // Limpiar caché para forzar recarga de datos
        clearCache()
      }

      // Intentar cargar historias
      let storiesData: Story[] = []
      try {
        storiesData = await getStoriesClient()
      } catch (err) {
        console.error("Error al cargar historias:", err)
        setError("Error al cargar las historias. Por favor, inténtalo de nuevo más tarde.")
      }

      // Intentar cargar etiquetas (incluso si falló la carga de historias)
      let tagsData: Tag[] = []
      try {
        tagsData = await getAllTagsClient()
      } catch (err) {
        console.error("Error al cargar etiquetas:", err)
        // No establecemos error aquí para permitir que la página se cargue con historias
      }

      // Verificar que solo se muestren historias publicadas
      const publishedStories = storiesData.filter((story) => story.published === true)

      setStories(publishedStories)
      setTags(tagsData)
    } catch (err) {
      console.error("Error general al cargar datos:", err)
      setError("Error al cargar el contenido. Por favor, inténtalo de nuevo más tarde.")
    } finally {
      setLoading(false)
      setIsRetrying(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filtrar historias populares según el período seleccionado
  const getFilteredPopularStories = () => {
    if (popularTimeFilter === "all") {
      return [...stories].sort((a, b) => b.upvotes - a.upvotes)
    }

    const now = new Date()
    let cutoffDate: Date

    if (popularTimeFilter === "week") {
      cutoffDate = new Date(now.setDate(now.getDate() - 7))
    } else if (popularTimeFilter === "month") {
      cutoffDate = new Date(now.setMonth(now.getMonth() - 1))
    } else {
      return [...stories].sort((a, b) => b.upvotes - a.upvotes)
    }

    return [...stories]
      .filter((story) => new Date(story.created_at) >= cutoffDate)
      .sort((a, b) => b.upvotes - a.upvotes)
  }

  if (loading && !isRetrying) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-muted-foreground">Cargando historias...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Crónicas Laborales</h1>
          <Link href="/submit">
            <Button className="bg-purple-600 hover:bg-purple-700 order-last sm:order-none">
              <PlusCircle className="mr-2 h-4 w-4" />
              Comparte tu Historia
            </Button>
          </Link>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          Experiencias reales sobre ambientes laborales. Lee, aprende y sabe que no estás solo.
        </p>
      </section>

      <OfflineBanner />

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => loadData(true)} className="ml-4" disabled={isRetrying}>
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Reintentando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar
                </>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isRetrying && (
        <div className="flex justify-center items-center py-4">
          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
          <span>Actualizando datos...</span>
        </div>
      )}

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

      <Tabs defaultValue="latest" className="w-full" onValueChange={(value) => setActiveTab(value as "latest" | "top")}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="latest">Más Recientes</TabsTrigger>
            <TabsTrigger value="top">Más Populares</TabsTrigger>
          </TabsList>

          {activeTab === "top" && (
            <Select
              value={popularTimeFilter}
              onValueChange={(value) => setPopularTimeFilter(value as "week" | "month" | "all")}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Filtrar por período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mes</SelectItem>
                <SelectItem value="all">Todos los tiempos</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

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
              <p className="text-muted-foreground">
                {error
                  ? "No se pudieron cargar las historias."
                  : "No hay historias publicadas aún. ¡Sé el primero en compartir!"}
              </p>
              {error && (
                <Button onClick={() => loadData(true)} className="mt-4" variant="outline" disabled={isRetrying}>
                  {isRetrying ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Reintentando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reintentar
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="top" className="space-y-4">
          {stories.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {getFilteredPopularStories().map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {error
                  ? "No se pudieron cargar las historias."
                  : "No hay historias publicadas aún. ¡Sé el primero en compartir!"}
              </p>
              {error && (
                <Button onClick={() => loadData(true)} className="mt-4" variant="outline" disabled={isRetrying}>
                  {isRetrying ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Reintentando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reintentar
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
