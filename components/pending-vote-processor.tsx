"use client"

import { useEffect } from "react"
import { upvoteStory, upvoteComment } from "@/lib/actions"
import {
  getPendingVote,
  clearPendingVote,
  PendingVote,
} from "@/lib/pending-vote-service"
import { useSupabase } from "@/lib/supabase-provider"

export function PendingVoteProcessor() {
  const { session } = useSupabase()

  useEffect(() => {
    const processVote = async (vote: PendingVote) => {
      try {
        if (vote.type === "story") {
          await upvoteStory(vote.id)
        } else if (vote.type === "comment" && vote.storyId) {
          await upvoteComment(vote.id, vote.storyId)
        }
      } catch (error) {
        console.error("Error al procesar voto pendiente:", error)
      } finally {
        clearPendingVote()
      }
    }

    if (session) {
      const vote = getPendingVote()
      if (vote) {
        processVote(vote)
      }
    }
  }, [session])

  return null
}
