"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { StoryCard } from "@/components/story-card"
import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Story } from "@/lib/types"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function searchStories() {
      if (!query) {
        setStories([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const supabase = createClientComponentClient()

        const { data, error } = await supabase
          .from("stories")
          .select(`
            *,
            profiles(username),
            story_tags(
              tags(id, name)
            )
          `)
          .or(`title.ilike.%${query}%, content.ilike.%${query}%`)
          .eq("published", true)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching stories:", error)
          throw error
        }

        // Formatear los resultados para que coincidan con la estructura esperada por StoryCard
        const formattedStories =
          data?.map((story) => {
            const tags = story.story_tags?.map((st) => st.tags) || []
            return {
              ...story,
              tags,
            }
          }) || []

        setStories(formattedStories)
      } catch (err) {
        console.error("Error al buscar historias:", err)
        setError("Error al buscar historias. Por favor, inténtalo de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    searchStories()
  }, [query])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-muted-foreground">Buscando historias...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Error al buscar</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-6">Resultados de búsqueda: {query}</h1>

      <div className="mb-8">
        <SearchBar />
      </div>

      {stories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">No se encontraron resultados</h2>
          <p className="text-muted-foreground">
            No hay historias que coincidan con "{query}". Intenta con otros términos.
          </p>
        </div>
      )}
    </div>
  )
}
