"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { directApproveStory } from "@/lib/direct-approve"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

export default function DirectApprovePage() {
  const [storyId, setStoryId] = useState("")
  const [result, setResult] = useState<any>(null)
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

  const handleDirectApprove = async () => {
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
      setResult(null)

      // Llamar a la función de aprobación directa
      const approveResult = await directApproveStory(storyId)
      setResult(approveResult)

      if (approveResult.success) {
        toast({
          title: "Aprobación exitosa",
          description: "La historia ha sido aprobada directamente",
        })

        // Actualizar la información de la historia
        await checkStory()
      } else {
        toast({
          title: "Error",
          description: `Error al aprobar: ${approveResult.error}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al aprobar historia:", error)
      setResult({ success: false, error: String(error) })
      toast({
        title: "Error",
        description: "Error inesperado al aprobar la historia",
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
          <CardTitle>Aprobación Directa de Historias</CardTitle>
          <CardDescription>
            Herramienta simplificada para aprobar historias directamente en la base de datos
          </CardDescription>
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
                onClick={handleDirectApprove}
                disabled={loading || storyData.published}
                variant="default"
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? "Aprobando..." : "Aprobar Directamente"}
              </Button>
            </div>
          )}

          {result && (
            <div className={`mt-4 p-4 border rounded-md ${result.success ? "border-green-500" : "border-red-500"}`}>
              <h3 className="font-medium mb-2">Resultado de la operación</h3>
              <pre className="bg-muted p-2 rounded text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
