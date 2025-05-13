"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { generateUniqueUsername } from "@/lib/username-generator"

// Buscar la función createInitialProfile y modificarla para asegurar que siempre se genera un nombre de usuario

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
      // Si existe pero no tiene nombre de usuario, generarle uno
      if (!existingProfile.username) {
        const username = await generateUniqueUsername(supabase)

        const { error } = await supabase.from("profiles").update({ username }).eq("id", user.id)

        if (error) {
          console.error("Error updating username for existing profile:", error)
          throw new Error("Failed to update username for existing profile")
        }
      }

      return { success: true }
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

// Modificar la función submitStory para incluir el nombre visible si existe

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

    const userId = session.user.id

    // Verificar si el usuario es administrador y obtener su perfil
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("admin, username, display_name")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Error checking profile:", profileError)
      throw new Error("Failed to check user profile")
    }

    const isAdmin = profileData?.admin || false
    const username = profileData?.username || "Anónimo"
    const displayName = profileData?.display_name || null

    // Si no es administrador, verificar el límite diario de historias
    if (!isAdmin) {
      // Obtener la fecha actual en formato ISO (YYYY-MM-DD)
      const today = new Date().toISOString().split("T")[0]

      // Consultar cuántas historias ha publicado el usuario hoy
      const { data: storiesCount, error: countError } = await supabase
        .from("stories")
        .select("id", { count: "exact" })
        .eq("user_id", userId)
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`)

      if (countError) {
        console.error("Error counting daily stories:", countError)
        throw new Error("Failed to check daily story limit")
      }

      // Verificar si el usuario ha alcanzado el límite diario (3 historias)
      if ((storiesCount?.length || 0) >= 3) {
        return {
          success: false,
          error: "Has alcanzado el límite de 3 historias por día. Intenta de nuevo mañana.",
        }
      }
    }

    // Usar el nombre de usuario o "Anónimo" si se seleccionó anónimo
    const author = isAnonymous ? "Anónimo" : username

    // Insertar la historia con el nombre visible si existe y no es anónimo
    const { data: storyData, error: storyError } = await supabase
      .from("stories")
      .insert({
        title,
        content,
        author,
        display_name: isAnonymous ? null : displayName, // Incluir el nombre visible si no es anónimo
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

// Modificar la función submitComment para incluir el nombre visible si existe

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

export async function upvoteStory(storyId: string) {
  const supabase = createServerActionClient({ cookies })
  console.log(`[upvoteStory] Iniciando proceso para story_id: ${storyId}`)

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.log("[upvoteStory] No hay sesión activa")
      throw new Error("No session found")
    }

    const userId = session.user.id
    console.log(`[upvoteStory] Usuario: ${userId}`)

    // Verificar si el usuario ya votó por esta historia
    console.log(`[upvoteStory] Verificando si el usuario ya votó`)
    const { data: existingVote, error: checkError } = await supabase
      .from("upvotes")
      .select("*")
      .eq("story_id", storyId)
      .eq("user_id", userId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 es el código para "no se encontró ningún registro"
      console.error("[upvoteStory] Error al verificar voto existente:", checkError)
      return { success: false, error: "Error al verificar voto existente" }
    }

    // Si el usuario ya votó, no hacer nada y devolver éxito
    if (existingVote) {
      console.log("[upvoteStory] El usuario ya había votado por esta historia")
      return { success: true, alreadyVoted: true }
    }

    // Primero, obtener el valor actual de upvotes
    console.log(`[upvoteStory] Obteniendo contador actual de upvotes`)
    const { data: currentStory, error: fetchError } = await supabase
      .from("stories")
      .select("upvotes")
      .eq("id", storyId)
      .single()

    if (fetchError) {
      console.error("[upvoteStory] Error al obtener contador actual:", fetchError)
      return { success: false, error: "Error al obtener el contador actual de votos" }
    }

    // Calcular el nuevo valor de upvotes
    const currentUpvotes = currentStory?.upvotes || 0
    const newUpvotes = currentUpvotes + 1
    console.log(`[upvoteStory] Contador actual: ${currentUpvotes}, Nuevo contador: ${newUpvotes}`)

    // Usar una función RPC personalizada para actualizar el contador
    console.log(`[upvoteStory] Registrando voto en la tabla upvotes`)
    const { error: insertError } = await supabase.from("upvotes").insert({
      story_id: storyId,
      user_id: userId,
    })

    if (insertError) {
      console.error("[upvoteStory] Error al registrar voto:", insertError)
      return { success: false, error: "Error al registrar el voto" }
    }

    // Actualizar directamente con SQL raw a través de una función RPC
    console.log(`[upvoteStory] Actualizando contador en la tabla stories`)

    // Método 1: Actualización directa con valor explícito
    const { error: updateError } = await supabase
      .from("stories")
      .update({ upvotes: newUpvotes })
      .eq("id", storyId)
      .select()

    if (updateError) {
      console.error("[upvoteStory] Error al actualizar contador:", updateError)
      // Intentar revertir la inserción del voto
      await supabase.from("upvotes").delete().eq("story_id", storyId).eq("user_id", userId)
      return { success: false, error: "Error al actualizar el contador de votos" }
    }

    // Verificar que el contador se actualizó correctamente
    console.log(`[upvoteStory] Verificando actualización del contador`)
    const { data: updatedStory, error: verifyError } = await supabase
      .from("stories")
      .select("upvotes")
      .eq("id", storyId)
      .single()

    if (verifyError) {
      console.error("[upvoteStory] Error al verificar actualización:", verifyError)
    } else {
      console.log(`[upvoteStory] Contador verificado: ${updatedStory?.upvotes}`)
    }

    // Revalidar las rutas para que se actualicen los datos
    console.log(`[upvoteStory] Revalidando rutas`)
    revalidatePath("/")
    revalidatePath(`/story/${storyId}`)

    return {
      success: true,
      newUpvoteCount: updatedStory?.upvotes || newUpvotes,
    }
  } catch (error) {
    console.error("[upvoteStory] Error general:", error)
    return { success: false, error: "Error al procesar el voto" }
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

// Modificar la función updateStory para añadir un parámetro explícito para el contenido mejorado
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
