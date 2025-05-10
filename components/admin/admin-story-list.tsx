"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, X, Eye, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { approveStory, rejectStory } from "@/lib/actions"
import type { Story } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export function AdminStoryList({ stories }: { stories: Story[] }) {
  const [pendingStories, setPendingStories] = useState(stories)
  const [storyToReject, setStoryToReject] = useState<Story | null>(null)
  const [isApproving, setIsApproving] = useState<string | null>(null)
  const [isRejecting, setIsRejecting] = useState(false)
  const { toast } = useToast()

  const handleApprove = async (storyId: string) => {
    try {
      setIsApproving(storyId)

      console.log(`Intentando aprobar historia: ${storyId}`)
      const result = await approveStory(storyId)
      console.log("Resultado de aprobación:", result)

      if (!result || !result.success) {
        throw new Error("No se pudo aprobar la historia")
      }

      setPendingStories((prev) => prev.filter((story) => story.id !== storyId))

      toast({
        title: "Historia aprobada",
        description: "La historia ha sido publicada en el sitio",
      })

      // Recargar la página para asegurar que los cambios se reflejen
      window.location.reload()
    } catch (error) {
      console.error("Error al aprobar historia:", error)
      toast({
        title: "Error",
        description: "Error al aprobar la historia. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsApproving(null)
    }
  }

  const handleReject = async (storyId: string) => {
    try {
      setIsRejecting(true)

      console.log(`Intentando rechazar historia: ${storyId}`)
      await rejectStory(storyId)

      setPendingStories((prev) => prev.filter((story) => story.id !== storyId))
      setStoryToReject(null)

      toast({
        title: "Historia rechazada",
        description: "La historia ha sido eliminada",
      })
    } catch (error) {
      console.error("Error al rechazar historia:", error)
      toast({
        title: "Error",
        description: "Error al rechazar la historia",
        variant: "destructive",
      })
    } finally {
      setIsRejecting(false)
    }
  }

  if (pendingStories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay historias pendientes de revisión.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {pendingStories.map((story) => (
          <div key={story.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{story.title}</h3>
                  {!story.published && (
                    <Badge
                      variant="outline"
                      className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                    >
                      Pendiente
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Por {story.author} • {story.industry} • {new Date(story.created_at).toLocaleDateString("es-ES")}
                </p>
                <p className="mt-2 text-sm line-clamp-2">{story.content.substring(0, 150)}...</p>

                {story.tags && story.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {story.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/story/${story.id}`} target="_blank">
                  <Button variant="outline" size="icon" title="Ver historia">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  onClick={() => handleApprove(story.id)}
                  variant="outline"
                  size="icon"
                  className="text-green-500"
                  title="Aprobar historia"
                  disabled={isApproving === story.id}
                >
                  {isApproving === story.id ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={() => setStoryToReject(story)}
                  variant="outline"
                  size="icon"
                  className="text-red-500"
                  title="Rechazar historia"
                  disabled={isApproving === story.id}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!storyToReject} onOpenChange={(open) => !open && setStoryToReject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirmar rechazo
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres rechazar esta historia? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {storyToReject && (
            <div className="py-4">
              <h3 className="font-medium">{storyToReject.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">Por {storyToReject.author}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setStoryToReject(null)} disabled={isRejecting}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => storyToReject && handleReject(storyToReject.id)}
              disabled={isRejecting}
            >
              {isRejecting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Rechazando...
                </>
              ) : (
                "Rechazar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
