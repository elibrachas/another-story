"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, X, Eye } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { adminApproveStory, adminRejectStory } from "@/lib/actions"
import type { Story } from "@/lib/types"

export function PendingStories({ stories }: { stories: Story[] }) {
  const [pendingStories, setPendingStories] = useState(stories)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const { toast } = useToast()

  const handleApprove = async (storyId: string) => {
    try {
      setIsProcessing(storyId)
      const result = await adminApproveStory(storyId)

      if (!result.success) {
        throw new Error(result.error || "Error al aprobar la historia")
      }

      setPendingStories((prev) => prev.filter((story) => story.id !== storyId))
      toast({
        title: "Historia aprobada",
        description: "La historia ha sido publicada correctamente",
      })
    } catch (error) {
      console.error("Error al aprobar historia:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al aprobar la historia",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  const handleReject = async (storyId: string) => {
    if (!confirm("¿Estás seguro de que quieres rechazar esta historia? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      setIsProcessing(storyId)
      const result = await adminRejectStory(storyId)

      if (!result.success) {
        throw new Error(result.error || "Error al rechazar la historia")
      }

      setPendingStories((prev) => prev.filter((story) => story.id !== storyId))
      toast({
        title: "Historia rechazada",
        description: "La historia ha sido eliminada correctamente",
      })
    } catch (error) {
      console.error("Error al rechazar historia:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al rechazar la historia",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
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
    <div className="space-y-4">
      {pendingStories.map((story) => (
        <Card key={story.id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{story.title}</h3>
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
              <Button
                onClick={() => handleApprove(story.id)}
                variant="outline"
                size="icon"
                className="text-green-500"
                disabled={isProcessing === story.id}
              >
                {isProcessing === story.id ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={() => handleReject(story.id)}
                variant="outline"
                size="icon"
                className="text-red-500"
                disabled={isProcessing === story.id}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
