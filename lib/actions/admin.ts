"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// Función auxiliar para verificar si el usuario es administrador
async function isAdmin(supabase: any) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return false
  }

  const { data, error } = await supabase.from("profiles").select("admin").eq("id", session.user.id).single()

  if (error || !data) {
    return false
  }

  return data.admin === true
}

// Función para obtener estadísticas de la aplicación
export async function getAppStats(): Promise<{ success: boolean; stats?: any; error?: string }> {
  const supabase = createServerActionClient({ cookies })

  try {
    // Verificar si el usuario es administrador
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      return { success: false, error: "No autenticado" }
    }

    const { data: profileData } = await supabase.from("profiles").select("admin").eq("id", userData.user.id).single()

    if (!profileData?.admin) {
      return { success: false, error: "No tienes permisos de administrador" }
    }

    // Obtener estadísticas
    const [
      totalStoriesResult,
      pendingStoriesResult,
      publishedStoriesResult,
      totalCommentsResult,
      totalUsersResult,
      newUsersResult,
      totalUpvotesResult,
    ] = await Promise.all([
      supabase.from("stories").select("id", { count: "exact" }),
      supabase.from("stories").select("id", { count: "exact" }).eq("published", false),
      supabase.from("stories").select("id", { count: "exact" }).eq("published", true),
      supabase.from("comments").select("id", { count: "exact" }),
      supabase.from("profiles").select("id", { count: "exact" }),
      supabase
        .from("profiles")
        .select("id", { count: "exact" })
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from("stories").select("upvotes").eq("published", true),
    ])

    // Calcular total de votos
    const totalUpvotes = totalUpvotesResult.data?.reduce((sum, story) => sum + (story.upvotes || 0), 0) || 0

    const stats = {
      totalStories: totalStoriesResult.count || 0,
      pendingStories: pendingStoriesResult.count || 0,
      publishedStories: publishedStoriesResult.count || 0,
      totalComments: totalCommentsResult.count || 0,
      totalUsers: totalUsersResult.count || 0,
      newUsers: newUsersResult.count || 0,
      totalUpvotes: totalUpvotes,
    }

    return { success: true, stats }
  } catch (error) {
    console.error("Error in getAppStats action:", error)
    return { success: false, error: "Failed to get app stats" }
  }
}

export async function approveStory(storyId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Verificar si el usuario es administrador
    const admin = await isAdmin(supabase)

    if (!admin) {
      return { success: false, error: "No tienes permisos para realizar esta acción" }
    }

    // Obtener la sesión del usuario
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Aprobar la historia
    const { error } = await supabase
      .from("stories")
      .update({
        published: true,
        approved_by: session?.user.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", storyId)

    if (error) {
      console.error("Error al aprobar historia:", error)
      return { success: false, error: "Error al aprobar la historia" }
    }

    // Registrar la acción en los logs de administración
    await supabase.from("admin_logs").insert({
      action: "story_approved",
      user_id: session?.user.id,
      details: { story_id: storyId },
    })

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error al aprobar historia:", error)
    return { success: false, error: "Error al procesar la solicitud" }
  }
}

export async function rejectStory(storyId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Verificar si el usuario es administrador
    const admin = await isAdmin(supabase)

    if (!admin) {
      return { success: false, error: "No tienes permisos para realizar esta acción" }
    }

    // Obtener la sesión del usuario
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Rechazar la historia
    const { error } = await supabase
      .from("stories")
      .update({
        published: false,
        rejected: true,
        rejected_by: session?.user.id,
        rejected_at: new Date().toISOString(),
      })
      .eq("id", storyId)

    if (error) {
      console.error("Error al rechazar historia:", error)
      return { success: false, error: "Error al rechazar la historia" }
    }

    // Registrar la acción en los logs de administración
    await supabase.from("admin_logs").insert({
      action: "story_rejected",
      user_id: session?.user.id,
      details: { story_id: storyId },
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error al rechazar historia:", error)
    return { success: false, error: "Error al procesar la solicitud" }
  }
}

export async function deleteStory(storyId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Verificar si el usuario es administrador
    const admin = await isAdmin(supabase)

    if (!admin) {
      return { success: false, error: "No tienes permisos para realizar esta acción" }
    }

    // Obtener la sesión del usuario
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Eliminar las etiquetas asociadas a la historia
    const { error: tagError } = await supabase.from("story_tags").delete().eq("story_id", storyId)

    if (tagError) {
      console.error("Error al eliminar etiquetas:", tagError)
      // Continuamos con la eliminación de la historia
    }

    // Eliminar los comentarios asociados a la historia
    const { error: commentError } = await supabase.from("comments").delete().eq("story_id", storyId)

    if (commentError) {
      console.error("Error al eliminar comentarios:", commentError)
      // Continuamos con la eliminación de la historia
    }

    // Eliminar los upvotes asociados a la historia
    const { error: upvoteError } = await supabase.from("upvotes").delete().eq("story_id", storyId)

    if (upvoteError) {
      console.error("Error al eliminar upvotes:", upvoteError)
      // Continuamos con la eliminación de la historia
    }

    // Eliminar la historia
    const { error } = await supabase.from("stories").delete().eq("id", storyId)

    if (error) {
      console.error("Error al eliminar historia:", error)
      return { success: false, error: "Error al eliminar la historia" }
    }

    // Registrar la acción en los logs de administración
    await supabase.from("admin_logs").insert({
      action: "story_deleted",
      user_id: session?.user.id,
      details: { story_id: storyId },
    })

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error al eliminar historia:", error)
    return { success: false, error: "Error al procesar la solicitud" }
  }
}

export async function updateStory(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Verificar si el usuario es administrador
    const admin = await isAdmin(supabase)

    if (!admin) {
      return { success: false, error: "No tienes permisos para realizar esta acción" }
    }

    const storyId = formData.get("id") as string
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const industry = formData.get("industry") as string
    const published = formData.get("published") === "on"
    const tagIds = formData.getAll("tags") as string[]

    // Validar campos obligatorios
    if (!storyId || !title.trim() || !content.trim() || !industry.trim()) {
      return { success: false, error: "Todos los campos son obligatorios" }
    }

    // Obtener la sesión
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Actualizar la historia
    const { error } = await supabase
      .from("stories")
      .update({
        title,
        content,
        industry,
        published,
        updated_at: new Date().toISOString(),
        updated_by: session?.user.id,
      })
      .eq("id", storyId)

    if (error) {
      console.error("Error al actualizar historia:", error)
      return { success: false, error: "Error al actualizar la historia" }
    }

    // Eliminar las etiquetas existentes
    const { error: deleteTagsError } = await supabase.from("story_tags").delete().eq("story_id", storyId)

    if (deleteTagsError) {
      console.error("Error al eliminar etiquetas:", deleteTagsError)
      // Continuamos con la inserción de nuevas etiquetas
    }

    // Insertar las nuevas etiquetas
    if (tagIds.length > 0) {
      const storyTags = tagIds.map((tagId) => ({
        story_id: storyId,
        tag_id: tagId,
      }))

      const { error: insertTagsError } = await supabase.from("story_tags").insert(storyTags)

      if (insertTagsError) {
        console.error("Error al insertar etiquetas:", insertTagsError)
        // No retornamos error aquí, la historia ya se actualizó
      }
    }

    // Registrar la acción en los logs de administración
    await supabase.from("admin_logs").insert({
      action: "story_updated",
      user_id: session?.user.id,
      details: { story_id: storyId, title },
    })

    revalidatePath(`/story/${storyId}`)
    revalidatePath("/admin")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Error al actualizar historia:", error)
    return { success: false, error: "Error al procesar la solicitud" }
  }
}

export async function approveComment(commentId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Verificar si el usuario es administrador
    const admin = await isAdmin(supabase)

    if (!admin) {
      return { success: false, error: "No tienes permisos para realizar esta acción" }
    }

    // Obtener la sesión del usuario
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Aprobar el comentario
    const { error } = await supabase
      .from("comments")
      .update({
        approved: true,
        approved_by: session?.user.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", commentId)

    if (error) {
      console.error("Error al aprobar comentario:", error)
      return { success: false, error: "Error al aprobar el comentario" }
    }

    // Registrar la acción en los logs de administración
    await supabase.from("admin_logs").insert({
      action: "comment_approved",
      user_id: session?.user.id,
      details: { comment_id: commentId },
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error al aprobar comentario:", error)
    return { success: false, error: "Error al procesar la solicitud" }
  }
}

export async function rejectComment(commentId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Verificar si el usuario es administrador
    const admin = await isAdmin(supabase)

    if (!admin) {
      return { success: false, error: "No tienes permisos para realizar esta acción" }
    }

    // Obtener la sesión del usuario
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Rechazar el comentario
    const { error } = await supabase
      .from("comments")
      .update({
        approved: false,
        rejected: true,
        rejected_by: session?.user.id,
        rejected_at: new Date().toISOString(),
      })
      .eq("id", commentId)

    if (error) {
      console.error("Error al rechazar comentario:", error)
      return { success: false, error: "Error al rechazar el comentario" }
    }

    // Registrar la acción en los logs de administración
    await supabase.from("admin_logs").insert({
      action: "comment_rejected",
      user_id: session?.user.id,
      details: { comment_id: commentId },
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error al rechazar comentario:", error)
    return { success: false, error: "Error al procesar la solicitud" }
  }
}

export async function deleteComment(commentId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Verificar si el usuario es administrador
    const admin = await isAdmin(supabase)

    if (!admin) {
      return { success: false, error: "No tienes permisos para realizar esta acción" }
    }

    // Obtener la sesión del usuario
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Eliminar los upvotes asociados al comentario
    const { error: upvoteError } = await supabase.from("comment_upvotes").delete().eq("comment_id", commentId)

    if (upvoteError) {
      console.error("Error al eliminar upvotes:", upvoteError)
      // Continuamos con la eliminación del comentario
    }

    // Eliminar el comentario
    const { error } = await supabase.from("comments").delete().eq("id", commentId)

    if (error) {
      console.error("Error al eliminar comentario:", error)
      return { success: false, error: "Error al eliminar el comentario" }
    }

    // Registrar la acción en los logs de administración
    await supabase.from("admin_logs").insert({
      action: "comment_deleted",
      user_id: session?.user.id,
      details: { comment_id: commentId },
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error al eliminar comentario:", error)
    return { success: false, error: "Error al procesar la solicitud" }
  }
}

// Función para eliminar un comentario
export async function adminDeleteComment(commentId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerActionClient({ cookies })

  try {
    // Verificar si el usuario es administrador
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      return { success: false, error: "No autenticado" }
    }

    const { data: profileData } = await supabase.from("profiles").select("admin").eq("id", userData.user.id).single()

    if (!profileData?.admin) {
      return { success: false, error: "No tienes permisos de administrador" }
    }

    // Eliminar el comentario
    const { error } = await supabase.from("comments").delete().eq("id", commentId)

    if (error) {
      console.error("Error deleting comment:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error in adminDeleteComment action:", error)
    return { success: false, error: "Failed to delete comment" }
  }
}

// Función para actualizar una historia
export async function updateStory_old({
  id,
  title,
  content,
  industry,
  tags,
  customTags,
  publish,
  useImprovedContent,
}: {
  id: string
  title: string
  content: string
  industry: string
  tags: string[]
  customTags: string[]
  publish: boolean
  useImprovedContent?: boolean
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerActionClient({ cookies })

  try {
    // Verificar si el usuario es administrador
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      return { success: false, error: "No autenticado" }
    }

    const { data: profileData } = await supabase.from("profiles").select("admin").eq("id", userData.user.id).single()

    if (!profileData?.admin) {
      return { success: false, error: "No tienes permisos de administrador" }
    }

    console.log("Actualizando historia:", {
      id,
      title,
      contentPreview: content.substring(0, 50) + "...",
      contentLength: content.length,
      industry,
      publish,
      useImprovedContent,
    })

    // Actualizar la historia - solo título, contenido, industria y estado de publicación
    const { error: updateError } = await supabase
      .from("stories")
      .update({
        title,
        content,
        industry,
        published: publish,
      })
      .eq("id", id)

    if (updateError) {
      console.error("Error updating story:", updateError)
      return { success: false, error: updateError.message }
    }

    // Ya no manipulamos las etiquetas - mantenemos las originales

    revalidatePath("/admin")
    revalidatePath(`/story/${id}`)
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error in updateStory action:", error)
    return { success: false, error: "Failed to update story" }
  }
}

// Función para mejorar el contenido de una historia con IA
export async function improveStoryWithAI(content: string): Promise<{
  success: boolean
  improvedContent?: string
  error?: string
}> {
  try {
    // Verificar si el usuario es administrador
    const supabase = createServerActionClient({ cookies })
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      return { success: false, error: "No autenticado" }
    }

    const { data: profileData } = await supabase.from("profiles").select("admin").eq("id", userData.user.id).single()

    if (!profileData?.admin) {
      return { success: false, error: "No tienes permisos de administrador" }
    }

    // Construir la URL absoluta
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https"
    const host = process.env.NEXT_PUBLIC_VERCEL_URL || "localhost:3000"
    const baseUrl = `${protocol}://${host}`

    console.log("Haciendo solicitud a:", `${baseUrl}/api/admin/improve-content`)

    // Obtener las cookies para pasarlas a la solicitud
    const cookieStore = cookies()
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ")

    // Usar nuestra API Route para mejorar el contenido con manejo de errores mejorado
    const response = await fetch(`${baseUrl}/api/admin/improve-content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: cookieHeader, // Pasar las cookies para mantener la sesión
      },
      body: JSON.stringify({ content }),
      cache: "no-store",
      credentials: "include", // Importante para incluir cookies
    })

    // Si la respuesta no es OK, intentar obtener el texto para depuración
    if (!response.ok) {
      const contentType = response.headers.get("content-type") || ""

      if (contentType.includes("application/json")) {
        const errorData = await response.json()
        console.error("Error JSON de la API:", errorData)
        return { success: false, error: errorData.error || `Error ${response.status}: ${response.statusText}` }
      } else {
        // Si no es JSON, obtener el texto para depuración
        const textResponse = await response.text()
        console.error("Respuesta no-JSON de la API:", textResponse.substring(0, 500)) // Primeros 500 caracteres
        return { success: false, error: `Error ${response.status}: La API no devolvió JSON válido` }
      }
    }

    // Procesar la respuesta JSON
    const data = await response.json()

    if (!data.success) {
      return { success: false, error: data.error || "Error al mejorar el contenido" }
    }

    return { success: true, improvedContent: data.improvedContent }
  } catch (error) {
    console.error("Error in improveStoryWithAI action:", error)
    return { success: false, error: error instanceof Error ? error.message : "Error al mejorar el contenido con IA" }
  }
}
