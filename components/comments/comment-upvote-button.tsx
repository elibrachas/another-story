"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from "lucide-react"
import { LoginDialog } from "@/components/auth/login-dialog"
import { upvoteComment } from "@/lib/actions/comments"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase-provider"

export function CommentUpvoteButton({
  commentId,
  initialUpvotes,
}: {
  commentId: string
  initialUpvotes: number
}) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const { session } = useSupabase()
  const { toast } = useToast()

  const handleUpvote = async () => {
    if (!session) {
      setShowLoginDialog(true)
      return
    }

    if (isLoading) return

    try {
      setIsLoading(true)

      // Actualización optimista de la UI
      setUpvotes((prev) => prev + 1)

      // Enviar al servidor
      const result = await upvoteComment(commentId)

      if (!result.success) {
        // Revertir cambios si hay error
        setUpvotes((prev) => prev - 1)

        toast({
          title: "Error",
          description: result.error || "Error al votar por el comentario",
          variant: "destructive",
        })
      }
    } catch (error) {
      // Revertir cambios si hay error
      setUpvotes((prev) => prev - 1)

      toast({
        title: "Error",
        description: "Error al votar por el comentario",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={handleUpvote} disabled={isLoading} className="h-auto p-1">
        <ThumbsUp className={`h-3 w-3 mr-1 ${isLoading ? "animate-pulse" : ""}`} />
        <span className="text-xs">{upvotes}</span>
      </Button>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </>
  )
}
