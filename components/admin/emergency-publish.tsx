"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { forcePublishStory, checkStoryPublishStatus } from "@/lib/direct-db-access"

export function EmergencyPublish() {
  const [storyId, setStoryId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [storyStatus, setStoryStatus] = useState<any>(null)
  const { toast } = useToast()

  const handleCheckStatus = async () => {
    if (!storyId) {
      toast({
        title: "Error",
        description: "Por favor, introduce un ID de historia",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const status = await checkStoryPublishStatus(storyId)
      setStoryStatus(status)

      toast({
        title: "Estado verificado",
        description: `La historia "${status.title}" está ${status.published ? "publicada" : "pendiente"}`,
      })
    } catch (error) {
      console.error("Error al verificar estado:", error)
      toast({
        title: "Error",
        description: "Error al verificar el estado de la historia",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForcePublish = async () => {
    if (!storyId) {
      toast({
        title: "Error",
        description: "Por favor, introduce un ID de historia",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const result = await forcePublishStory(storyId)

      toast({
        title: "Publicación forzada",
        description: "La historia ha sido publicada forzosamente",
      })

      // Actualizar el estado
      await handleCheckStatus()

      // Recargar la página después de 2 segundos
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error("Error al forzar publicación:", error)
      toast({
        title: "Error",
        description: "Error al forzar la publicación de la historia",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-red-300">
      <CardHeader>
        <CardTitle className="text-red-500">Herramienta de Emergencia</CardTitle>
        <CardDescription>Usar solo en caso de que la aprobación normal no funcione</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Precaución</AlertTitle>
          <AlertDescription>
            Esta herramienta modifica directamente la base de datos. Úsala solo cuando la aprobación normal no funcione.
          </AlertDescription>
        </Alert>

        <div className="flex items-center gap-2">
          <Input placeholder="ID de la historia" value={storyId} onChange={(e) => setStoryId(e.target.value)} />
          <Button onClick={handleCheckStatus} disabled={isLoading} variant="outline">
            Verificar
          </Button>
        </div>

        {storyStatus && (
          <div className="p-4 border rounded-md">
            <h3 className="font-medium mb-2">Estado actual</h3>
            <div className="space-y-2">
              <p>
                <strong>Título:</strong> {storyStatus.title}
              </p>
              <p>
                <strong>Estado:</strong> {storyStatus.published ? "Publicada" : "Pendiente"}
              </p>
              <p>
                <strong>Creada:</strong> {new Date(storyStatus.created_at).toLocaleString()}
              </p>
              {storyStatus.updated_at && (
                <p>
                  <strong>Actualizada:</strong> {new Date(storyStatus.updated_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleForcePublish} disabled={isLoading || !storyId} variant="destructive" className="w-full">
          {isLoading ? "Procesando..." : "Forzar Publicación"}
        </Button>
      </CardFooter>
    </Card>
  )
}
