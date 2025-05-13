"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

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

// Función para aprobar una historia
export async function approveStory(storyId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerActionClient({ cookies })

  try {
    const { error } = await supabase.from("stories").update({ published: true }).eq("id", storyId)

    if (error) {
      console.error("Error approving story:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error in approveStory action:", error)
    return { success: false, error: "Failed to approve story" }
  }
}

// Función para rechazar una historia
export async function rejectStory(storyId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServerActionClient({ cookies })

  try {
    const { error } = await supabase.from("stories").delete().eq("id", storyId)

    if (error) {
      console.error("Error rejecting story:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error in rejectStory action:", error)
    return { success: false, error: "Failed to reject story" }
  }
}

// Función para aprobar una historia (versión admin)
export async function adminApproveStory(
  storyId: string,
): Promise<{ success: boolean; error?: string; logs?: string[] }> {
  const supabase = createServerActionClient({ cookies })
  const logs: string[] = []

  try {
    // Verificar si el usuario es administrador
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      return { success: false, error: "No autenticado", logs }
    }

    const { data: profileData } = await supabase.from("profiles").select("admin").eq("id", userData.user.id).single()

    if (!profileData?.admin) {
      return { success: false, error: "No tienes permisos de administrador", logs }
    }

    // Aprobar la historia
    const { error } = await supabase.from("stories").update({ published: true }).eq("id", storyId)

    if (error) {
      console.error("Error approving story:", error)
      return { success: false, error: error.message, logs }
    }

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true, logs }
  } catch (error) {
    console.error("Error in adminApproveStory action:", error)
    return { success: false, error: "Failed to approve story", logs }
  }
}

// Función para rechazar una historia (versión admin)
export async function adminRejectStory(storyId: string): Promise<{ success: boolean; error?: string }> {
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

    // Eliminar la historia
    const { error } = await supabase.from("stories").delete().eq("id", storyId)

    if (error) {
      console.error("Error rejecting story:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error in adminRejectStory action:", error)
    return { success: false, error: "Failed to reject story" }
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
export async function updateStory({
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
