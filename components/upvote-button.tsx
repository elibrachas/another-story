"use client"

import { useState } from "react"
import { ThumbsUp } from "lucide-react"
import { upvoteStory } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"

const LoginDialog = dynamic(
  () => import("@/components/login-dialog").then((m) => m.LoginDialog),
  { loading: () => null }
)
import { useSupabase } from "@/lib/supabase-provider"
import { savePendingVote } from "@/lib/pending-vote-service"

interface UpvoteButtonProps {
  storyId: string
  initialUpvotes: number
}

export function UpvoteButton({ storyId, initialUpvotes }: UpvoteButtonProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [isUpvoting, setIsUpvoting] = useState(false)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const { toast } = useToast()
  const { session } = useSupabase()
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  const handleUpvote = async () => {
    if (!session) {
      savePendingVote({ type: "story", id: storyId })
      setShowLoginDialog(true)
      return
    }

    if (hasUpvoted || isUpvoting) return

    setIsUpvoting(true)
    try {
      const result = await upvoteStory(storyId)

      if (result.success) {
        setUpvotes(result.upvotes || upvotes + 1)
        setHasUpvoted(true)
      } else {
        toast({
          title: "Error al votar",
          description: result.error || "No se pudo registrar tu voto. Inténtalo de nuevo más tarde.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al votar:", error)
      toast({
        title: "Error al votar",
        description: "Ocurrió un error inesperado. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      })
    } finally {
      setIsUpvoting(false)
    }
  }

  return (
    <>
      <button
        onClick={handleUpvote}
        disabled={isUpvoting || hasUpvoted}
        className={`flex items-center gap-1 text-sm ${
          hasUpvoted ? "text-purple-600" : "text-gray-500 hover:text-gray-700"
        } transition-colors disabled:opacity-70`}
        aria-label={hasUpvoted ? "Ya has votado" : "Votar por esta historia"}
      >
        <ThumbsUp className={`h-4 w-4 ${hasUpvoted ? "fill-purple-600" : ""}`} />
        <span>{upvotes}</span>
      </button>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </>
  )
}
