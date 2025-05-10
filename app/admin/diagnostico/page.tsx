"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { adminApproveStory } from "@/lib/actions"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { approveStoryDirectAPI } from "@/lib/direct-api"

export default function DiagnosticoAprobacionPage() {
  const [storyId, setStoryId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [storyDetails, setStoryDetails] = useState<any>(null)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const fetchStoryDetails = async () => {
    if (!storyId) return

    try {
      setIsLoading(true)
      setLogs((prev) => [...prev, `Buscando detalles de la historia ID: ${storyId}`])

      const { data, error } = await supabase.from("stories").select("*").eq("id", storyId).single()

      if (error) {
        setLogs((prev) => [...prev, `Error al obtener detalles: ${error.message}`])
        toast({
          title: "Error",
          description: `No se pudo encontrar la historia: ${error.message}`,
          variant: "destructive",
        })
        return
      }

      setStoryDetails(data)
      setLogs((prev) => [...prev, `Historia encontrada: ${JSON.stringify(data)}`])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setLogs((prev) => [...prev, `Error inesperado: ${errorMessage}`])
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveStory = async () => {
    if (!storyId) {
      toast({
        title: "Error",
        description: "Por favor ingresa un ID de historia",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      setLogs([`Iniciando diagnóstico de aprobación para historia ID: ${storyId}`])

      // Intentar aprobar la historia
      const result = await adminApproveStory(storyId)

      // Mostrar los logs detallados
      if (result.logs) {
        setLogs((prev) => [...prev, ...result.logs])
      }

      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Error al aprobar la historia",
          variant: "destructive",
        })
        return
      }

      // Verificar el estado actual después de la aprobación
      const { data, error } = await supabase.from("stories").select("*").eq("id", storyId).single()

      if (error) {
        setLogs((prev) => [...prev, `Error al verificar estado final: ${error.message}`])
      } else {
        setLogs((prev) => [...prev, `Estado final verificado: ${JSON.stringify(data)}`])
        setStoryDetails(data)
      }

      toast({
        title: "Operación completada",
        description: result.success ? "Historia aprobada correctamente" : "Error en la aprobación",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setLogs((prev) => [...prev, `Error inesperado: ${errorMessage}`])
      toast({
        title: "Error",
        description: "Error inesperado durante la aprobación",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDirectUpdate = async () => {
    if (!storyId) return

    try {
      setIsLoading(true)
      setLogs((prev) => [...prev, `Intentando actualización directa con Supabase para historia ID: ${storyId}`])

      const { data, error } = await supabase.from("stories").update({ published: true }).eq("id", storyId).select()

      if (error) {
        setLogs((prev) => [...prev, `Error en actualización directa: ${error.message}`])
        toast({
          title: "Error",
          description: `Error en actualización directa: ${error.message}`,
          variant: "destructive",
        })
      } else {
        setLogs((prev) => [...prev, `Actualización directa exitosa: ${JSON.stringify(data)}`])

        // Verificar el estado actual
        const { data: verifyData, error: verifyError } = await supabase
          .from("stories")
          .select("*")
          .eq("id", storyId)
          .single()

        if (verifyError) {
          setLogs((prev) => [...prev, `Error al verificar estado final: ${verifyError.message}`])
        } else {
          setLogs((prev) => [...prev, `Estado final verificado: ${JSON.stringify(verifyData)}`])
          setStoryDetails(verifyData)
        }

        toast({
          title: "Actualización directa",
          description: "Operación completada",
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setLogs((prev) => [...prev, `Error inesperado: ${errorMessage}`])
    } finally {
      setIsLoading(false)
    }
  }

  // Nueva función para usar la API directa con la clave proporcionada
  const handleDirectAPI = async () => {
    if (!storyId) return

    try {
      setIsLoading(true)
      setLogs((prev) => [...prev, `Intentando actualización con API directa para historia ID: ${storyId}`])

      const result = await approveStoryDirectAPI(storyId)

      if (!result.success) {
        setLogs((prev) => [...prev, `Error en API directa: ${result.error}`])
        toast({
          title: "Error",
          description: `Error en API directa: ${result.error}`,
          variant: "destructive",
        })
      } else {
        setLogs((prev) => [...prev, `API directa ejecutada con éxito`])

        // Verificar el estado actual
        const { data: verifyData, error: verifyError } = await supabase
          .from("stories")
          .select("*")
          .eq("id", storyId)
          .single()

        if (verifyError) {
          setLogs((prev) => [...prev, `Error al verificar estado final: ${verifyError.message}`])
        } else {
          setLogs((prev) => [...prev, `Estado final verificado: ${JSON.stringify(verifyData)}`])
          setStoryDetails(verifyData)
        }

        toast({
          title: "API Directa",
          description: "Operación completada",
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      setLogs((prev) => [...prev, `Error inesperado: ${errorMessage}`])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Diagnóstico de Aprobación de Historias</h1>

      <Card>
        <CardHeader>
          <CardTitle>Herramienta de Diagnóstico</CardTitle>
          <CardDescription>Prueba y diagnostica el proceso de aprobación de historias</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="storyId">ID de Historia</Label>
            <div className="flex gap-2">
              <Input
                id="storyId"
                value={storyId}
                onChange={(e) => setStoryId(e.target.value)}
                placeholder="Ingresa el ID de la historia"
              />
              <Button onClick={fetchStoryDetails} disabled={isLoading || !storyId}>
                Buscar
              </Button>
            </div>
          </div>

          {storyDetails && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Detalles de la Historia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">ID:</div>
                    <div>{storyDetails.id}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">Título:</div>
                    <div>{storyDetails.title}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">Autor:</div>
                    <div>{storyDetails.author}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">Publicada:</div>
                    <div>{storyDetails.published ? "Sí" : "No"}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">Fecha de creación:</div>
                    <div>{new Date(storyDetails.created_at).toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              onClick={handleApproveStory}
              disabled={isLoading || !storyId}
              className="bg-green-600 hover:bg-green-700"
            >
              Aprobar con Server Action
            </Button>
            <Button onClick={handleDirectUpdate} disabled={isLoading || !storyId} variant="outline">
              Actualización Directa
            </Button>
            <Button
              onClick={handleDirectAPI}
              disabled={isLoading || !storyId}
              variant="outline"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              API Directa con Clave
            </Button>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Logs de Diagnóstico</h3>
            <div className="bg-muted p-4 rounded-md h-80 overflow-auto">
              {logs.length === 0 ? (
                <p className="text-muted-foreground">Los logs aparecerán aquí...</p>
              ) : (
                <pre className="whitespace-pre-wrap text-sm">
                  {logs.map((log, index) => (
                    <div key={index} className="py-1 border-b border-border last:border-0">
                      {log}
                    </div>
                  ))}
                </pre>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
