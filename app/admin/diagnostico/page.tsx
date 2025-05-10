"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

export default function DiagnosticoPage() {
  const [storyId, setStoryId] = useState("")
  const [storyData, setStoryData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const checkStory = async () => {
    if (!storyId) {
      toast({
        title: "Error",
        description: "Por favor, introduce un ID de historia",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const supabase = createClientComponentClient()

      // Verificar el estado actual de la historia
      const { data, error } = await supabase.from("stories").select("*").eq("id", storyId).single()

      if (error) {
        throw error
      }

      setStoryData(data)

      toast({
        title: "Información recuperada",
        description: `Historia "${data.title}" - Publicada: ${data.published ? "Sí" : "No"}`,
      })
    } catch (error) {
      console.error("Error al verificar historia:", error)
      toast({
        title: "Error",
        description: "No se pudo obtener información de la historia",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const togglePublished = async () => {
    if (!storyData) return

    try {
      setLoading(true)
      const supabase = createClientComponentClient()

      // Cambiar el estado de publicación
      const newPublishedState = !storyData.published

      const { data, error } = await supabase
        .from("stories")
        .update({ published: newPublishedState })
        .eq("id", storyId)
        .select()
        .single()

      if (error) {
        throw error
      }

      setStoryData(data)

      toast({
        title: "Estado actualizado",
        description: `Historia ahora está ${newPublishedState ? "publicada" : "no publicada"}`,
      })
    } catch (error) {
      console.error("Error al actualizar historia:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la historia",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico de Historias</CardTitle>
          <CardDescription>Verifica y modifica el estado de publicación de las historias</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="ID de la historia" value={storyId} onChange={(e) => setStoryId(e.target.value)} />
            <Button onClick={checkStory} disabled={loading}>
              {loading ? "Verificando..." : "Verificar"}
            </Button>
          </div>

          {storyData && (
            <div className="mt-4 space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Información de la historia</h3>
                <p>
                  <strong>ID:</strong> {storyData.id}
                </p>
                <p>
                  <strong>Título:</strong> {storyData.title}
                </p>
                <p>
                  <strong>Autor:</strong> {storyData.author}
                </p>
                <p>
                  <strong>Publicada:</strong> {storyData.published ? "Sí" : "No"}
                </p>
                <p>
                  <strong>Fecha de creación:</strong> {new Date(storyData.created_at).toLocaleString()}
                </p>
              </div>

              <Button
                onClick={togglePublished}
                disabled={loading}
                variant={storyData.published ? "destructive" : "default"}
              >
                {loading ? "Actualizando..." : storyData.published ? "Despublicar" : "Publicar"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
