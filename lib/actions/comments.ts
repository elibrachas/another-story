"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// Función para enviar un comentario
export async function submitComment({
  storyId,
  content,
  isAnonymous,
}: {
  storyId: string
  content: string
  isAnonymous: boolean
}) {
  const supabase = createServerActionClient({ cookies })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw new Error("No session found")
    }

    const userId = session.user.id

    // Obtener el perfil del usuario para el nombre de usuario y nombre visible
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("username, display_name")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      throw new Error("Failed to fetch user profile")
    }

    const username = profileData?.username || "Anónimo"
    const displayName = profileData?.display_name || null

    // Usar el nombre de usuario o "Anónimo" si se seleccionó anónimo
    const author = isAnonymous ? "Anónimo" : username

    const { error } = await supabase.from("comments").insert({
      story_id: storyId,
      user_id: userId,
      content,
      author,
      display_name: isAnonymous ? null : displayName, // Incluir el nombre visible si no es anónimo
    })

    if (error) {
      console.error("Error submitting comment:", error)
      throw new Error("Failed to submit comment")
    }

    revalidatePath(`/story/${storyId}`)
    return { success: true }
  } catch (error) {
    console.error("Error in submitComment action:", error)
    return { success: false, error: "Failed to submit comment" }
  }
}

// Función para dar upvote a un comentario
export async function upvoteComment(commentId: string, storyId: string) {
  const supabase = createServerActionClient({ cookies })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw new Error("No session found")
    }

    const userId = session.user.id

    // Verificar si el usuario ya votó por este comentario
    const { data: existingVote, error: checkError } = await supabase
      .from("comment_upvotes")
      .select("*")
      .eq("comment_id", commentId)
      .eq("user_id", userId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing comment vote:", checkError)
      return { success: false, error: "Error al verificar voto existente" }
    }

    // Si el usuario ya votó, no hacer nada y devolver éxito
    if (existingVote) {
      return { success: true, alreadyVoted: true }
    }

    // Primero, obtener el valor actual de upvotes
    const { data: currentComment, error: fetchError } = await supabase
      .from("comments")
      .select("upvotes")
      .eq("id", commentId)
      .single()

    if (fetchError) {
      console.error("Error fetching current comment upvotes:", fetchError)
      return { success: false, error: "Error al obtener el contador actual de votos" }
    }

    // Calcular el nuevo valor de upvotes
    const currentUpvotes = currentComment?.upvotes || 0
    const newUpvotes = currentUpvotes + 1

    // Registrar el voto del usuario en la tabla de votos
    const { error: insertError } = await supabase.from("comment_upvotes").insert({
      comment_id: commentId,
      user_id: userId,
    })

    if (insertError) {
      console.error("Error recording comment vote:", insertError)
      return { success: false, error: "Error al registrar el voto" }
    }

    // Incrementar el contador de votos en la tabla de comentarios con el valor explícito
    const { error: updateError } = await supabase.from("comments").update({ upvotes: newUpvotes }).eq("id", commentId)

    if (updateError) {
      console.error("Error upvoting comment:", updateError)
      // Intentar revertir la inserción del voto
      await supabase.from("comment_upvotes").delete().eq("comment_id", commentId).eq("user_id", userId)
      return { success: false, error: "Error al actualizar el contador de votos" }
    }

    revalidatePath(`/story/${storyId}`)

    return {
      success: true,
      newUpvoteCount: newUpvotes,
    }
  } catch (error) {
    console.error("Error in upvoteComment action:", error)
    return { success: false, error: "Error al procesar el voto" }
  }
}
