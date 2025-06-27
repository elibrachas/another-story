"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from "lucide-react"
import { LoginDialog } from "@/components/login-dialog"
import { upvoteComment } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase-provider"

export function CommentUpvoteButton({
  commentId,
  initialUpvotes,
  storyId,
}: {
  commentId: string
  initialUpvotes: number
  storyId: string
}) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const { session } = useSupabase()
  const { toast } = useToast()

  const handleUpvote = async () => {
    if (!session) {
      setShowLoginDialog(true)
      return
    }

    if (hasUpvoted) return

    try {
      await upvoteComment(commentId, storyId)
      setUpvotes((prev) => prev + 1)
      setHasUpvoted(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al votar por el comentario",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleUpvote}
        className={`gap-1 ${hasUpvoted ? "text-purple-500" : ""}`}
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{upvotes}</span>
      </Button>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </>
  )
}
