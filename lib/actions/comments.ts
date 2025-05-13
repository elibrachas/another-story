"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import type { Comment } from "@/lib/types"

export async function addComment({ storyId, content }: { storyId: string; content: string }) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Verificar si el usuario está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Debes iniciar sesión para comentar" }
    }

    // Validar contenido
    if (!content.trim()) {
      return { success: false, error: "El comentario no puede estar vacío" }
    }

    // Insertar el comentario
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .insert({
        story_id: storyId,
        user_id: session.user.id,
        content,
        approved: false, // Los comentarios requieren aprobación
      })
      .select()
      .single()

    if (commentError) {
      console.error("Error al insertar comentario:", commentError)
      return { success: false, error: "Error al guardar el comentario" }
    }

    // Registrar la acción en los logs de administración
    await supabase.from("admin_logs").insert({
      action: "comment_submitted",
      user_id: session.user.id,
      details: { comment_id: comment.id, story_id: storyId },
    })

    revalidatePath(`/story/${storyId}`)
    return { success: true, commentId: comment.id }
  } catch (error) {
    console.error("Error al enviar comentario:", error)
    return { success: false, error: "Error al procesar la solicitud" }
  }
}

export async function upvoteComment(commentId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Verificar si el usuario está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Debes iniciar sesión para votar" }
    }

    const userId = session.user.id

    // Verificar si el usuario ya ha votado por este comentario
    const { data: existingUpvote, error: checkError } = await supabase
      .from("comment_upvotes")
      .select("*")
      .eq("comment_id", commentId)
      .eq("user_id", userId)
      .maybeSingle()

    if (checkError) {
      console.error("Error al verificar upvote:", checkError)
      return { success: false, error: "Error al verificar voto" }
    }

    if (existingUpvote) {
      return { success: false, error: "Ya has votado por este comentario" }
    }

    // Insertar el upvote
    const { error: insertError } = await supabase.from("comment_upvotes").insert({
      comment_id: commentId,
      user_id: userId,
    })

    if (insertError) {
      console.error("Error al insertar upvote:", insertError)
      return { success: false, error: "Error al registrar voto" }
    }

    // Incrementar el contador de upvotes en el comentario
    const { error: updateError } = await supabase.rpc("increment_comment_upvotes", { comment_id_param: commentId })

    if (updateError) {
      console.error("Error al incrementar upvotes:", updateError)
      // No retornamos error aquí, el upvote ya se registró
    }

    // Obtener el comentario y la historia asociada
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .select("story_id")
      .eq("id", commentId)
      .single()

    if (!commentError) {
      revalidatePath(`/story/${comment.story_id}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error al procesar upvote:", error)
    return { success: false, error: "Error al procesar la solicitud" }
  }
}

export async function getCommentsByStoryId(storyId: string): Promise<Comment[]> {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        profiles:user_id (username, display_name)
      `)
      .eq("story_id", storyId)
      .eq("approved", true)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error al obtener comentarios:", error)
      return []
    }

    // Transformar los datos para que coincidan con el tipo Comment
    const comments: Comment[] = data.map((comment: any) => ({
      ...comment,
      username: comment.profiles.username,
      display_name: comment.profiles.display_name,
    }))

    return comments
  } catch (error) {
    console.error("Error al obtener comentarios:", error)
    return []
  }
}
