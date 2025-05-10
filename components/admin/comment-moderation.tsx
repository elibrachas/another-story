"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, X, Eye, Trash2, AlertTriangle } from "lucide-react"
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
import type { Comment } from "@/lib/types"

type CommentWithStory = Comment & {
  story_title: string
  story_id: string
  approved: boolean
}

export function CommentModeration({ comments }: { comments: CommentWithStory[] }) {
  const [commentList, setCommentList] = useState(comments)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [commentToDelete, setCommentToDelete] = useState<CommentWithStory | null>(null)
  const { toast } = useToast()

  const handleToggleApproved = async (commentId: string, currentStatus: boolean) => {
    try {
      setIsProcessing(commentId)

      const action = currentStatus ? "disapprove" : "approve"
      console.log(`Cambiando estado de comentario ID: ${commentId} a ${action}`)

      const response = await fetch("/api/admin/comment-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentId, action }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        const errorMessage = result.error || `Error ${response.status}`
        console.error(`Error al ${action} comentario:`, errorMessage)
        throw new Error(errorMessage)
      }

      // Actualizar el estado local
      setCommentList((prev) =>
        prev.map((comment) => (comment.id === commentId ? { ...comment, approved: !currentStatus } : comment)),
      )

      toast({
        title: "Estado actualizado",
        description: currentStatus ? "El comentario ha sido desaprobado" : "El comentario ha sido aprobado",
      })
    } catch (error) {
      console.error("Error al cambiar estado:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cambiar el estado del comentario",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!commentToDelete) return

    try {
      setIsProcessing(commentToDelete.id)

      const response = await fetch("/api/admin/delete-comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentId: commentToDelete.id }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        const errorMessage = result.error || `Error ${response.status}`
        console.error("Error al eliminar comentario:", errorMessage)
        throw new Error(errorMessage)
      }

      // Actualizar el estado local
      setCommentList((prev) => prev.filter((comment) => comment.id !== commentToDelete.id))

      toast({
        title: "Comentario eliminado",
        description: "El comentario ha sido eliminado permanentemente",
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
      setCommentToDelete(null)
    }
  }

  if (commentList.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay comentarios disponibles.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {commentList.map((comment) => (
          <Card key={comment.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">
                    Comentario en:{" "}
                    <Link href={`/story/${comment.story_id}`} className="text-purple-500 hover:underline">
                      {comment.story_title}
                    </Link>
                  </h3>
                  <Badge variant={comment.approved ? "success" : "outline"}>
                    {comment.approved ? "Aprobado" : "Pendiente"}
                  </Badge>
                </div>
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
                  onClick={() => handleToggleApproved(comment.id, comment.approved)}
                  variant="outline"
                  size="icon"
                  className={comment.approved ? "text-amber-500" : "text-green-500"}
                  disabled={isProcessing === comment.id}
                >
                  {isProcessing === comment.id ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : comment.approved ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={() => setCommentToDelete(comment)}
                  variant="outline"
                  size="icon"
                  className="text-red-500"
                  disabled={isProcessing === comment.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!commentToDelete} onOpenChange={(open) => !open && setCommentToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirmar eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar permanentemente este comentario?
              <div className="mt-2 p-2 border rounded-md bg-muted">
                <p className="font-medium">"{commentToDelete?.content}"</p>
                <p className="text-sm text-muted-foreground">Por {commentToDelete?.author}</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCommentToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isProcessing === commentToDelete?.id}>
              {isProcessing === commentToDelete?.id ? (
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
