"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { LoginDialog } from "@/components/auth/login-dialog"
import { useSupabase } from "@/lib/supabase-provider"
import { addComment } from "@/lib/actions/comments"

export function CommentForm({ storyId }: { storyId: string }) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const { session } = useSupabase()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      setShowLoginDialog(true)
      return
    }

    if (!content.trim()) {
      toast({
        title: "Error",
        description: "El comentario no puede estar vacío",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const result = await addComment({
        storyId,
        content: content.trim(),
      })

      if (result.success) {
        setContent("")
        toast({
          title: "Comentario enviado",
          description: "Tu comentario ha sido enviado y está pendiente de aprobación",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Error al enviar el comentario",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al enviar comentario:", error)
      toast({
        title: "Error",
        description: "Error al enviar el comentario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Textarea
            placeholder="Escribe tu comentario..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isLoading}
            className="min-h-[100px]"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading || !content.trim()} className="bg-purple-600 hover:bg-purple-700">
            {isLoading ? "Enviando..." : "Enviar comentario"}
          </Button>
        </div>
      </form>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </>
  )
}
