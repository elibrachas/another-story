"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { adminDeleteComment } from "@/lib/actions/admin"
import type { Comment } from "@/lib/types"

export function AdminCommentsList({ comments }: { comments: (Comment & { story_title: string; story_id: string })[] }) {
  const [commentsList, setCommentsList] = useState(comments)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDelete = async (commentId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      setIsProcessing(commentId)
      const result = await adminDeleteComment(commentId)

      if (!result.success) {
        throw new Error(result.error || "Error al eliminar el comentario")
      }

      setCommentsList((prev) => prev.filter((comment) => comment.id !== commentId))
      toast({
        title: "Comentario eliminado",
        description: "El comentario ha sido eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar comentario:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar el comentario",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  if (commentsList.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay comentarios para moderar.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {commentsList.map((comment) => (
        <Card key={comment.id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">
                Comentario en:{" "}
                <Link href={`/story/${comment.story_id}`} className="text-purple-500 hover:underline">
                  {comment.story_title}
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground">
                Por {comment.author} • {new Date(comment.created_at).toLocaleDateString("es-ES")}
              </p>
              <p className="mt-2 text-sm">{comment.content}</p>
              <p className="mt-1 text-xs text-muted-foreground">ID: {comment.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/story/${comment.story_id}`} target="_blank">
                <Button variant="outline" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                onClick={() => handleDelete(comment.id)}
                variant="outline"
                size="icon"
                className="text-red-500"
                disabled={isProcessing === comment.id}
              >
                {isProcessing === comment.id ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
