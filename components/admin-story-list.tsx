"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, X, Eye } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { approveStory, rejectStory } from "@/lib/actions"
import type { Story } from "@/lib/types"

export function AdminStoryList({ stories }: { stories: Story[] }) {
  const [pendingStories, setPendingStories] = useState(stories)
  const { toast } = useToast()

  const handleApprove = async (storyId: string) => {
    try {
      await approveStory(storyId)
      setPendingStories((prev) => prev.filter((story) => story.id !== storyId))
      toast({
        title: "Historia aprobada",
        description: "La historia ha sido publicada en el sitio",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al aprobar la historia",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (storyId: string) => {
    try {
      await rejectStory(storyId)
      setPendingStories((prev) => prev.filter((story) => story.id !== storyId))
      toast({
        title: "Historia rechazada",
        description: "La historia ha sido eliminada",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al rechazar la historia",
        variant: "destructive",
      })
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
    <div className="divide-y">
      {pendingStories.map((story) => (
        <div key={story.id} className="py-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{story.title}</h3>
              <p className="text-sm text-muted-foreground">
                Por {story.author} • {story.industry} • {new Date(story.created_at).toLocaleDateString("es-ES")}
              </p>
              <p className="mt-2 text-sm line-clamp-2">{story.content.substring(0, 150)}...</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/story/${story.id}`} target="_blank">
                <Button variant="outline" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              <Button onClick={() => handleApprove(story.id)} variant="outline" size="icon" className="text-green-500">
                <Check className="h-4 w-4" />
              </Button>
              <Button onClick={() => handleReject(story.id)} variant="outline" size="icon" className="text-red-500">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
