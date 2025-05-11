"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp } from "lucide-react"
import { LoginDialog } from "@/components/login-dialog"
import { upvoteStory } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase-provider"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function UpvoteButton({
  storyId,
  initialUpvotes,
}: {
  storyId: string
  initialUpvotes: number
}) {
  const [upvotes, setUpvotes] = useState(initialUpvotes)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const { session } = useSupabase()
  const { toast } = useToast()

  // Verificar si el usuario ya ha votado por esta historia
  useEffect(() => {
    async function checkIfUserHasUpvoted() {
      if (!session) return

      try {
        // Verificar en localStorage primero (más rápido)
        const localStorageKey = `upvoted_story_${storyId}`
        const hasUpvotedLocally = localStorage.getItem(localStorageKey) === "true"

        if (hasUpvotedLocally) {
          setHasUpvoted(true)
          return
        }

        // Si no está en localStorage, verificar en la base de datos
        const supabase = createClientComponentClient()
        const { data, error } = await supabase
          .from("upvotes") // Usar "upvotes" en lugar de "story_upvotes"
          .select("*")
          .eq("story_id", storyId)
          .eq("user_id", session.user.id)
          .single()

        if (data) {
          setHasUpvoted(true)
          // Guardar en localStorage para futuras verificaciones
          localStorage.setItem(localStorageKey, "true")
        }
      } catch (error) {
        console.error("Error al verificar upvote:", error)
      }
    }

    checkIfUserHasUpvoted()
  }, [session, storyId])

  const handleUpvote = async () => {
    if (!session) {
      setShowLoginDialog(true)
      return
    }

    if (hasUpvoted || isLoading) return

    try {
      setIsLoading(true)

      // Actualización optimista de la UI
      setUpvotes((prev) => prev + 1)
      setHasUpvoted(true)

      // Guardar en localStorage inmediatamente
      localStorage.setItem(`upvoted_story_${storyId}`, "true")

      // Enviar al servidor
      const result = await upvoteStory(storyId)

      if (!result.success) {
        // Revertir cambios si hay error
        setUpvotes((prev) => prev - 1)
        setHasUpvoted(false)
        localStorage.removeItem(`upvoted_story_${storyId}`)

        toast({
          title: "Error",
          description: result.error || "Error al votar por la historia",
          variant: "destructive",
        })
      } else if (result.newUpvoteCount !== null) {
        // Actualizar con el valor exacto del servidor si está disponible
        setUpvotes(result.newUpvoteCount)
      }
    } catch (error) {
      // Revertir cambios si hay error
      setUpvotes((prev) => prev - 1)
      setHasUpvoted(false)
      localStorage.removeItem(`upvoted_story_${storyId}`)

      toast({
        title: "Error",
        description: "Error al votar por la historia",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleUpvote}
        disabled={isLoading || hasUpvoted}
        className={`gap-1 ${hasUpvoted ? "text-purple-500" : ""}`}
      >
        <ThumbsUp className={`h-4 w-4 ${isLoading ? "animate-pulse" : ""}`} />
        <span>{upvotes}</span>
      </Button>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </>
  )
}
