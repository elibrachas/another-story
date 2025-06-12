"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { LoginDialog } from "@/components/login-dialog"
import { submitComment } from "@/lib/actions"
import { useSupabase } from "@/lib/supabase-provider"
import {
  savePendingComment,
  getPendingComment,
  clearPendingComment,
  setPendingCommentSubmissionFlag,
  getPendingCommentSubmissionFlag,
  clearPendingCommentSubmissionFlag,
} from "@/lib/pending-comment-service"

export function CommentForm({ storyId }: { storyId: string }) {
  const [content, setContent] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [pendingSubmission, setPendingSubmission] = useState(false)
  const { session } = useSupabase()
  const { toast } = useToast()

  // Cargar comentario pendiente cuando el usuario se autentica
  useEffect(() => {
    if (session) {
      const pending = getPendingComment()
      if (pending && pending.storyId === storyId) {
        const autoSubmit = getPendingCommentSubmissionFlag()
        setContent(pending.content)
        setIsAnonymous(pending.isAnonymous)

        if (autoSubmit) {
          setPendingSubmission(true)
        } else {
          const confirmLoad = window.confirm(
            "Encontramos un comentario sin enviar. ¿Deseas cargarlo?",
          )
          if (!confirmLoad) {
            setContent("")
          }
        }

        clearPendingComment()
      }
    }
  }, [session, storyId])

  // Enviar automáticamente si se indicó antes de iniciar sesión
  useEffect(() => {
    if (session && pendingSubmission) {
      handleSubmit(new Event("submit") as React.FormEvent)
      setPendingSubmission(false)
      clearPendingCommentSubmissionFlag()
    }
  }, [session, pendingSubmission])

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
      savePendingComment({ storyId, content, isAnonymous })
      setPendingSubmission(true)
      setPendingCommentSubmissionFlag(true)
      setShowLoginDialog(true)
      return
    }

    try {
      setIsSubmitting(true)

      await submitComment({
        storyId,
        content,
        isAnonymous,
      })

      setContent("")
      toast({
        title: "Comentario añadido",
        description: "Tu comentario ha sido publicado",
      })
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
