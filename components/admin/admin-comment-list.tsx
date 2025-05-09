"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, X, Eye, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { approveComment, rejectComment } from "@/lib/actions"
import type { AdminComment } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export function AdminCommentList({ comments }: { comments: AdminComment[] }) {
  const [pendingComments, setPendingComments] = useState(comments)
  const [commentToReject, setCommentToReject] = useState<AdminComment | null>(null)
  const { toast } = useToast()

  const handleApprove = async (commentId: string) => {
    try {
      await approveComment(commentId)
      setPendingComments((prev) => prev.filter((comment) => comment.id !== commentId))
      toast({
        title: "Comentario aprobado",
        description: "El comentario ha sido publicado",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al aprobar el comentario",
        variant: "destructive",
      })
    }
  }

  const handleReject = async (commentId: string) => {
    try {
      await rejectComment(commentId)
      setPendingComments((prev) => prev.filter((comment) => comment.id !== commentId))
      setCommentToReject(null)
      toast({
        title: "Comentario rechazado",
        description: "El comentario ha sido eliminado",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al rechazar el comentario",
        variant: "destructive",
      })
    }
  }

  if (pendingComments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No hay comentarios pendientes de revisión.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {pendingComments.map((comment) => (
          <div key={comment.id} className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Comentario en: {comment.story_title}</h3>
                  {!comment.approved && (
                    <Badge
                      variant="outline"
                      className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                    >
                      Pendiente
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Por {comment.author} • {new Date(comment.created_at).toLocaleDateString("es-ES")}
                </p>
                <p className="mt-2 text-sm">{comment.content}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/story/${comment.story_id}`} target="_blank">
                  <Button variant="outline" size="icon" title="Ver historia">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  onClick={() => handleApprove(comment.id)}
                  variant="outline"
                  size="icon"
                  className="text-green-500"
                  title="Aprobar comentario"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setCommentToReject(comment)}
                  variant="outline"
                  size="icon"
                  className="text-red-500"
                  title="Rechazar comentario"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!commentToReject} onOpenChange={(open) => !open && setCommentToReject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirmar rechazo
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres rechazar este comentario? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {commentToReject && (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">Por {commentToReject.author}</p>
              <p className="mt-2">{commentToReject.content}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCommentToReject(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => commentToReject && handleReject(commentToReject.id)}>
              Rechazar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
