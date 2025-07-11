"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { LoginDialog } from "@/components/login-dialog"
import { submitComment } from "@/lib/actions"
import { useSupabase } from "@/lib/supabase-provider"
import { savePendingComment, getPendingComment, clearPendingComment } from "@/lib/pending-comment-service"

export function CommentForm({ storyId }: { storyId: string }) {
  const [content, setContent] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const { session } = useSupabase()
  const { toast } = useToast()

  // Restaurar comentario pendiente al cargar el componente
  useEffect(() => {
    const pendingComment = getPendingComment()
    if (pendingComment && pendingComment.storyId === storyId) {
      setContent(pendingComment.content)
      setIsAnonymous(pendingComment.isAnonymous)
      console.log("Comentario pendiente restaurado")
    }
  }, [storyId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content) {
      toast({
        title: "Comentario vacío",
        description: "Por favor escribe algo antes de enviar",
        variant: "destructive",
      })
      return
    }

    if (!session) {
      // Guardar el comentario antes de mostrar el diálogo de login
      savePendingComment({
        storyId,
        content,
        isAnonymous,
      })

      setShowLoginDialog(true)
      return
    }

    try {
      setIsSubmitting(true)

      const result = await submitComment({
        storyId,
        content,
        isAnonymous,
      })

      if (result.success) {
        setContent("")
        // Limpiar cualquier comentario pendiente si la publicación fue exitosa
        clearPendingComment()
        toast({
          title: "Comentario añadido",
          description: "Tu comentario ha sido publicado",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al publicar tu comentario",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al publicar tu comentario",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Comparte tus pensamientos..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="comment-anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded border-gray-400"
            />
            <label htmlFor="comment-anonymous" className="text-sm font-normal">
              Comentar anónimamente
            </label>
          </div>
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
            {isSubmitting ? "Publicando..." : "Publicar Comentario"}
          </Button>
        </div>
      </form>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </>
  )
}
