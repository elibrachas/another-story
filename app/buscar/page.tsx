"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { StoryCard } from "@/components/stories/story-card"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/layout/search-bar"
import { ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"
import { searchStoriesClient } from "@/lib/supabase-client"
import type { Story } from "@/lib/types"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    async function searchStories() {
      if (!query.trim()) {
        setStories([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const results = await searchStoriesClient(query)
        setStories(results)
      } catch (err) {
        console.error("Error al buscar historias:", err)
        setError("Error al buscar historias. Por favor, inténtalo de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    searchStories()
  }, [query])

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      setError(null)
      const results = await searchStoriesClient(query)
      setStories(results)
    } catch (err) {
      console.error("Error al reintentar búsqueda:", err)
      setError("Error al buscar historias. Por favor, inténtalo de nuevo más tarde.")
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Resultados de búsqueda</h1>
      </div>

      <div className="max-w-xl">
        <SearchBar defaultValue={query} />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-muted-foreground">Buscando historias...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRetry} variant="outline" disabled={isRetrying}>
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
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {query.trim() ? `No se encontraron historias para "${query}"` : "Ingresa un término para buscar"}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Se encontraron {stories.length} {stories.length === 1 ? "historia" : "historias"} para "{query}"
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
