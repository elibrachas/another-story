"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { getPendingSubmissionFlag } from "@/lib/pending-story-service"

export function PendingSubmissionRedirect() {
  const { session } = useSupabase()
  const router = useRouter()

  useEffect(() => {
    if (session && getPendingSubmissionFlag()) {
      router.push("/submit")
    }
  }, [session, router])

  return null
}
