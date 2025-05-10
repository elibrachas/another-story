"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { generateUniqueUsername } from "@/lib/username-generator"

export async function createInitialProfile() {
  const supabase = createServerActionClient({ cookies })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("No user found")
    }

    // Verificar si ya existe un perfil para este usuario
    const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (existingProfile) {
      return { success: true } // El perfil ya existe, no es necesario hacer nada
    }

    // Generar un nombre de usuario único
    const username = await generateUniqueUsername(supabase)

    // Crear el perfil inicial
    const { error } = await supabase.from("profiles").insert({
      id: user.id,
      username: username,
      email: user.email,
      admin: false, // Asegurarse de que los nuevos usuarios no sean administradores
    })

    if (error) {
      console.error("Error creating initial profile:", error)
      throw new Error("Failed to create initial profile")
    }

    revalidatePath("/profile") // O cualquier otra ruta relevante
    return { success: true }
  } catch (error) {
    console.error("Error in createInitialProfile action:", error)
    return { success: false, error: "Failed to create initial profile" }
  }
}

export async function submitStory({
  title,
  content,
  industry,
  isAnonymous,
  tags,
  customTags,
}: {
  title: string
  content: string
  industry: string
  isAnonymous: boolean
  tags: string[]
  customTags: string[]
}) {
  const supabase = createServerActionClient({ cookies })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw new Error("No session found")
    }

    const author = isAnonymous ? "Anónimo" : session.user.email || "Anónimo"
    const userId = session.user.id

    // Insertar la historia
    const { data: storyData, error: storyError } = await supabase
      .from("stories")
      .insert({
        title,
        content,
        author,
        industry,
        user_id: userId,
        published: false, // Las historias se envían como no publicadas para revisión
      })
      .select()
      .single()

    if (storyError) {
      console.error("Error submitting story:", storyError)
      throw new Error("Failed to submit story")
    }

    const storyId = storyData.id

    // Asignar etiquetas predefinidas
    if (tags && tags.length > 0) {
      const storyTags = tags.map((tagId) => ({ story_id: storyId, tag_id: tagId }))

      const { error: tagsError } = await supabase.from("story_tags").insert(storyTags)

      if (tagsError) {
        console.error("Error assigning tags to story:", tagsError)
        throw new Error("Failed to assign tags to story")
      }
    }

    // Crear y asignar etiquetas personalizadas
    if (customTags && customTags.length > 0) {
      for (const tagName of customTags) {
        // Verificar si la etiqueta ya existe (para evitar duplicados)
        const { data: existingTag } = await supabase.from("tags").select("*").eq("name", tagName).single()

        let tagId: string

        if (existingTag) {
          // Si la etiqueta existe, usar su ID
          tagId = existingTag.id
        } else {
          // Si no existe, crear la etiqueta
          const { data: newTag, error: newTagError } = await supabase
            .from("tags")
            .insert({ name: tagName })
            .select()
            .single()

          if (newTagError) {
            console.error("Error creating custom tag:", newTagError)
            throw new Error("Failed to create custom tag")
          }

          tagId = newTag.id
        }

        // Asignar la etiqueta a la historia
        const { error: customTagError } = await supabase.from("story_tags").insert({ story_id: storyId, tag_id: tagId })

        if (customTagError) {
          console.error("Error assigning custom tag to story:", customTagError)
          throw new Error("Failed to assign custom tag to story")
        }
      }
    }

    revalidatePath("/")
    revalidatePath("/submit")
    return { success: true }
  } catch (error) {
    console.error("Error in submitStory action:", error)
    return { success: false, error: "Failed to submit story" }
  }
}

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

    const author = isAnonymous ? "Anónimo" : session.user.email || "Anónimo"
    const userId = session.user.id

    const { error } = await supabase.from("comments").insert({
      story_id: storyId,
      user_id: userId,
      content,
      author,
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

export async function upvoteStory(storyId: string) {
  const supabase = createServerActionClient({ cookies })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw new Error("No session found")
    }

    const userId = session.user.id

    // Verificar si el usuario ya votó por esta historia
    const { data: existingVote } = await supabase
      .from("story_upvotes")
      .select("*")
      .eq("story_id", storyId)
      .eq("user_id", userId)
      .single()

    if (existingVote) {
      // El usuario ya votó, no hacer nada
      return { success: true }
    }

    // Incrementar el contador de votos en la tabla de historias
    const { error: upvoteError } = await supabase
      .from("stories")
      .update({ upvotes: () => "upvotes + 1" })
      .eq("id", storyId)

    if (upvoteError) {
      console.error("Error upvoting story:", upvoteError)
      throw new Error("Failed to upvote story")
    }

    // Registrar el voto del usuario en la tabla de votos
    const { error: voteRecordError } = await supabase.from("story_upvotes").insert({
      story_id: storyId,
      user_id: userId,
    })

    if (voteRecordError) {
      console.error("Error recording vote:", voteRecordError)
      throw new Error("Failed to record vote")
    }

    revalidatePath("/")
    revalidatePath(`/story/${storyId}`)
    return { success: true }
  } catch (error) {
    console.error("Error in upvoteStory action:", error)
    return { success: false, error: "Failed to upvote story" }
  }
}

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
    const { data: existingVote } = await supabase
      .from("comment_upvotes")
      .select("*")
      .eq("comment_id", commentId)
      .eq("user_id", userId)
      .single()

    if (existingVote) {
      // El usuario ya votó, no hacer nada
      return { success: true }
    }

    // Incrementar el contador de votos en la tabla de comentarios
    const { error: upvoteError } = await supabase
      .from("comments")
      .update({ upvotes: () => "upvotes + 1" })
      .eq("id", commentId)

    if (upvoteError) {
      console.error("Error upvoting comment:", upvoteError)
      throw new Error("Failed to upvote comment")
    }

    // Registrar el voto del usuario en la tabla de votos
    const { error: voteRecordError } = await supabase.from("comment_upvotes").insert({
      comment_id: commentId,
      user_id: userId,
    })

    if (voteRecordError) {
      console.error("Error recording vote:", voteRecordError)
      throw new Error("Failed to record vote")
    }

    revalidatePath(`/story/${storyId}`)
    return { success: true }
  } catch (error) {
    console.error("Error in upvoteComment action:", error)
    return { success: false, error: "Failed to upvote comment" }
  }
}

export async function updateProfile({
  displayName,
  bio,
  website,
  regenerateUsername,
}: {
  displayName?: string
  bio?: string
  website?: string
  regenerateUsername?: boolean
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

    const updateData: { display_name?: string; bio?: string; website?: string; username?: string } = {}

    if (displayName !== undefined) {
      updateData.display_name = displayName
    }
    if (bio !== undefined) {
      updateData.bio = bio
    }
    if (website !== undefined) {
      updateData.website = website
    }

    if (regenerateUsername) {
      const username = await generateUniqueUsername(supabase)
      updateData.username = username
    }

    const { error } = await supabase.from("profiles").update(updateData).eq("id", userId)

    if (error) {
      console.error("Error updating profile:", error)
      throw new Error("Failed to update profile")
    }

    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    console.error("Error in updateProfile action:", error)
    return { success: false, error: "Failed to update profile" }
  }
}

// Nuevas funciones de administración
// Reemplazar la función adminApproveStory con esta versión que usa actualización directa

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
