"use client"

import { useState, useEffect } from "react"
import { SubmitForm } from "@/components/submit-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllTagsClient } from "@/lib/supabase-client"
import type { Tag } from "@/lib/types"

export default function SubmitPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTags() {
      try {
        const tagsData = await getAllTagsClient()
        setTags(tagsData)
      } catch (error) {
        console.error("Error al cargar etiquetas:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTags()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-muted-foreground">Cargando formulario...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Comparte tu Historia</CardTitle>
          <CardDescription>
            Tu historia será revisada antes de ser publicada. Todas las historias son anónimas por defecto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SubmitForm tags={tags} />
        </CardContent>
      </Card>
    </div>
  )
}
