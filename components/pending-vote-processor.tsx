"use client"

import { useEffect } from "react"
import { useSupabase } from "@/lib/supabase-provider"

/**
 * PendingVoteProcessor
 *
 * When a visitor casts an up-vote while offline or before we have their
 * authentication token, we temporarily store the vote in localStorage.
 * This tiny client component flushes that queue once the user is back
 * online / authenticated.
 *
 * For now it’s a no-op placeholder that simply clears the queue (if any)
 * and can be expanded later with real API calls.
 */
export function PendingVoteProcessor() {
  const { session } = useSupabase()

  useEffect(() => {
    const QUEUE_KEY = "pendingVotes"

    if (!session) return

    try {
      const raw = window.localStorage.getItem(QUEUE_KEY)
      if (!raw) return

      const pendingVotes = JSON.parse(raw)
      // TODO: send votes to the API – here we just discard them
      window.localStorage.removeItem(QUEUE_KEY)
    } catch {
      /* swallow errors – we don't want to break the UI */
    }
  }, [session])

  return null
}
