"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { StoryCard } from "@/components/story-card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getStoriesByTagClient, getAllTagsClient } from "@/lib/supabase-client"
import type { Story, Tag } from "@/lib/types"

export default function TagPage({ params }: { params: { id: string } }) {
  const [stories, setStories] = useState<Story[]>([])
  const [currentTag, setCurrentTag] = useState<Tag | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        // Cargar etiquetas y historias
        const [storiesData, allTags] = await Promise.all([getStoriesByTagClient(params.id), getAllTagsClient()])

        const tagData = allTags.find((tag) => tag.id === params.id)

        if (!tagData) {
          router.push("/404")
          return
        }

        setStories(storiesData)
        setCurrentTag(tagData)
      } catch (err) {
        console.error("Error al cargar datos:", err)
        setError("Error al cargar el contenido. Por favor, inténtalo de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id, router])

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

  if (!currentTag) {
    return null
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
