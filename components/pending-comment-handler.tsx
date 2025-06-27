"use client"

import { useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/components/ui/use-toast"
import { submitComment } from "@/lib/actions"
import { getPendingComment, clearPendingComment } from "@/lib/pending-comment-service"

export function PendingCommentHandler() {
  const { session } = useSupabase()
  const { toast } = useToast()

  useEffect(() => {
    const handlePendingComment = async () => {
      // Solo procesar si hay una sesión activa
      if (!session) return

      const pendingComment = getPendingComment()
      if (!pendingComment) return

      try {
        console.log("Procesando comentario pendiente:", pendingComment)

        // Intentar publicar el comentario pendiente
        const result = await submitComment({
          storyId: pendingComment.storyId,
          content: pendingComment.content,
          isAnonymous: pendingComment.isAnonymous,
        })

        if (result.success) {
          // Limpiar el comentario pendiente si se publicó exitosamente
          clearPendingComment()

          toast({
            title: "¡Comentario publicado!",
            description: "Tu comentario se ha publicado automáticamente después del login.",
          })
        } else {
          console.error("Error al publicar comentario pendiente:", result.error)
          toast({
            title: "Error al publicar comentario",
            description: "Hubo un problema al publicar tu comentario. Por favor, inténtalo de nuevo.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error inesperado al procesar comentario pendiente:", error)
        toast({
          title: "Error inesperado",
          description: "Hubo un problema al publicar tu comentario. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        })
      }
    }

    // Ejecutar después de un pequeño delay para asegurar que la sesión esté completamente establecida
    const timeoutId = setTimeout(handlePendingComment, 1000)

    return () => clearTimeout(timeoutId)
  }, [session, toast])

  // Este componente no renderiza nada visible
  return null
}
