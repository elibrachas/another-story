"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { checkStoryStatus, listAllStories } from "@/lib/debug-utils"

export function DebugPanel() {
  const [storyId, setStoryId] = useState("")
  const [storyStatus, setStoryStatus] = useState<any>(null)
  const [allStories, setAllStories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
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
      setLoading(true)
      const status = await checkStoryStatus(storyId)
      setStoryStatus(status)
    } catch (error) {
      console.error("Error al verificar estado:", error)
      toast({
        title: "Error",
        description: "Error al verificar el estado de la historia",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleListAllStories = async () => {
    try {
      setLoading(true)
      const stories = await listAllStories()
      setAllStories(stories)
    } catch (error) {
      console.error("Error al listar historias:", error)
      toast({
        title: "Error",
        description: "Error al listar todas las historias",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Panel de Depuración</CardTitle>
        <CardDescription>Herramientas para verificar el estado de las historias</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input placeholder="ID de la historia" value={storyId} onChange={(e) => setStoryId(e.target.value)} />
            <Button onClick={handleCheckStatus} disabled={loading}>
              Verificar Estado
            </Button>
          </div>

          {storyStatus && (
            <div className="p-4 border rounded-md">
              <h3 className="font-medium mb-2">Estado de la historia</h3>
              <pre className="bg-muted p-2 rounded text-sm overflow-auto">{JSON.stringify(storyStatus, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Button onClick={handleListAllStories} disabled={loading} className="w-full">
            Listar Todas las Historias
          </Button>

          {allStories.length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Título</th>
                    <th className="p-2 text-left">Publicada</th>
                    <th className="p-2 text-left">Fecha de creación</th>
                  </tr>
                </thead>
                <tbody>
                  {allStories.map((story) => (
                    <tr key={story.id} className="border-t">
                      <td className="p-2 font-mono text-xs">{story.id}</td>
                      <td className="p-2">{story.title}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            story.published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {story.published ? "Sí" : "No"}
                        </span>
                      </td>
                      <td className="p-2">{new Date(story.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
