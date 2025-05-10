"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, X, Eye, Trash2, AlertTriangle, Edit } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { Story } from "@/lib/types"

export function AllStories({ stories }: { stories: Story[] }) {
  const [storyList, setStoryList] = useState(stories)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [storyToDelete, setStoryToDelete] = useState<Story | null>(null)
  const { toast } = useToast()

  const handleTogglePublished = async (storyId: string, currentStatus: boolean) => {
    try {
      setIsProcessing(storyId)

      const action = currentStatus ? "unpublish" : "publish"
      console.log(`Cambiando estado de historia ID: ${storyId} a ${action}`)

      const response = await fetch("/api/admin/story-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ storyId, action }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        const errorMessage = result.error || `Error ${response.status}`
        console.error(`Error al ${action} historia:`, errorMessage)
        throw new Error(errorMessage)
      }

      // Actualizar el estado local
      setStoryList((prev) =>
        prev.map((story) => (story.id === storyId ? { ...story, published: !currentStatus } : story)),
      )

      toast({
        title: "Estado actualizado",
        description: currentStatus ? "La historia ha sido despublicada" : "La historia ha sido publicada",
      })
    } catch (error) {
      console.error("Error al cambiar estado:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cambiar el estado de la historia",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!storyToDelete) return

    try {
      setIsProcessing(storyToDelete.id)

      const response = await fetch("/api/admin/delete-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ storyId: storyToDelete.id }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        const errorMessage = result.error || `Error ${response.status}`
        console.error("Error al eliminar historia:", errorMessage)
        throw new Error(errorMessage)
      }

      // Actualizar el estado local
      setStoryList((prev) => prev.filter((story) => story.id !== storyToDelete.id))

      toast({
        title: "Historia eliminada",
        description: "La historia ha sido eliminada permanentemente",
      })
    } catch (error) {
      console.error("Error al eliminar historia:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar la historia",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
      setStoryToDelete(null)
    }
  }

  if (storyList.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay historias disponibles.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {storyList.map((story) => (
          <Card key={story.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{story.title}</h3>
                  <Badge variant={story.published ? "success" : "outline"}>
                    {story.published ? "Publicada" : "Pendiente"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Por {story.author} • {story.industry} • {new Date(story.created_at).toLocaleDateString("es-ES")}
                </p>
                <p className="mt-2 text-sm line-clamp-2">{story.content.substring(0, 150)}...</p>
                <p className="mt-1 text-xs text-muted-foreground">ID: {story.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/story/${story.id}`} target="_blank">
                  <Button variant="outline" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/admin/edit-story/${story.id}`}>
                  <Button variant="outline" size="icon" className="text-blue-500">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  onClick={() => handleTogglePublished(story.id, story.published)}
                  variant="outline"
                  size="icon"
                  className={story.published ? "text-amber-500" : "text-green-500"}
                  disabled={isProcessing === story.id}
                >
                  {isProcessing === story.id ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : story.published ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={() => setStoryToDelete(story)}
                  variant="outline"
                  size="icon"
                  className="text-red-500"
                  disabled={isProcessing === story.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!storyToDelete} onOpenChange={(open) => !open && setStoryToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirmar eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar permanentemente esta historia?
              <div className="mt-2 p-2 border rounded-md bg-muted">
                <p className="font-medium">{storyToDelete?.title}</p>
                <p className="text-sm text-muted-foreground">Por {storyToDelete?.author}</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStoryToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isProcessing === storyToDelete?.id}>
              {isProcessing === storyToDelete?.id ? (
                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : null}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
