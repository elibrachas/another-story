"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { generateUniqueUsername } from "@/lib/username-generator"
import { sanitizeHtml } from "@/lib/sanitize"

export async function createInitialProfile() {
  const supabase = createServerActionClient({ cookies })

  try {
    console.log("Iniciando createInitialProfile...")

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      console.log("No hay sesión activa")
      return { success: false, error: "No session found" }
    }

    const userId = session.user.id
    console.log("Usuario autenticado:", userId)

    // Verificar si ya existe un perfil para este usuario
    const { data: existingProfile, error: existingProfileError } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("id", userId)
      .maybeSingle()

    console.log("Resultado de verificación de perfil:", { existingProfile, existingProfileError })

    if (existingProfileError && existingProfileError.code !== "PGRST116") {
      console.error("Error al verificar perfil existente:", existingProfileError)
      return { success: false, error: existingProfileError.message }
    }

    if (existingProfile) {
      console.log("El perfil ya existe:", existingProfile)
      return { success: true, message: "Profile already exists" }
    }

    // Generar un nombre de usuario único
    console.log("Generando nombre de usuario único...")
    const username = await generateUniqueUsername(supabase)
    console.log("Nombre de usuario generado:", username)

    // Obtener el país del usuario desde la cookie
    const cookieStore = cookies()
    const country = cookieStore.get("user-country")?.value || "XX"
    console.log("País del usuario:", country)

    // Crear el perfil inicial
    console.log("Creando perfil inicial...")
    const { data: newProfile, error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        username: username,
        admin: false,
        country: country, // Establecer el país del usuario
      })
      .select()
      .single()

    if (error) {
      console.error("Error al crear perfil inicial:", error)
      return { success: false, error: error.message }
    }

    console.log("Perfil creado exitosamente:", newProfile)
    return { success: true, profile: newProfile }
  } catch (error) {
    console.error("Error en createInitialProfile:", error)
    return { success: false, error: error instanceof Error ? error.message : "Error desconocido" }
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

    const userId = session.user.id

    // Obtener el nombre de usuario del perfil
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Error al obtener el nombre de usuario:", profileError)
      return { success: false, error: profileError.message }
    }

    const author = profile?.username || "Anónimo"

    const { error } = await supabase.from("comments").insert({
      story_id: storyId,
      user_id: userId,
      content: sanitizeHtml(content),
      author: isAnonymous ? "Anónimo" : author,
    })

    if (error) {
      console.error("Error submitting comment:", error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/story/${storyId}`)
    return { success: true }
  } catch (error) {
    console.error("Error in submitComment action:", error)
    return { success: false, error: "Failed to submit comment" }
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
  tags?: string[]
  customTags?: string[]
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

    // Obtener el nombre de usuario y país del perfil
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username, country")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.error("Error al obtener el perfil del usuario:", profileError)
      return { success: false, error: profileError.message }
    }

    const author = profile?.username || "Anónimo"
    const country = profile?.country || "XX"

    // Insertar la historia
    const { data: storyData, error: storyError } = await supabase
      .from("stories")
      .insert({
        title: sanitizeHtml(title),
        content: sanitizeHtml(content),
        author: isAnonymous ? "Anónimo" : author,
        industry: sanitizeHtml(industry),
        user_id: userId,
        published: false, // Las historias se envían como no publicadas por defecto
        country: country, // Incluir el país del usuario
      })
      .select()
      .single()

    if (storyError) {
      console.error("Error submitting story:", storyError)
      return { success: false, error: storyError.message }
    }

    const storyId = storyData.id

    // Procesar etiquetas
    const allTags = [...(tags || [])]

    // Insertar etiquetas personalizadas y obtener sus IDs
    if (customTags && customTags.length > 0) {
      for (const tagName of customTags) {
        // Verificar si la etiqueta ya existe
        const { data: existingTag, error: existingTagError } = await supabase
          .from("tags")
          .select("id")
          .eq("name", tagName)
          .single()

        if (existingTagError && existingTagError.status !== 406) {
          console.error("Error al verificar etiqueta existente:", existingTagError)
          return { success: false, error: existingTagError.message }
        }

        if (existingTag) {
          // La etiqueta ya existe, usar su ID
          allTags.push(existingTag.id)
        } else {
          // La etiqueta no existe, crearla
          const { data: newTag, error: newTagError } = await supabase
            .from("tags")
            .insert({ name: tagName })
            .select("id")
            .single()

          if (newTagError) {
            console.error("Error al crear etiqueta:", newTagError)
            return { success: false, error: newTagError.message }
          }

          allTags.push(newTag.id)
        }
      }
    }

    // Insertar relaciones en la tabla story_tags
    for (const tagId of allTags) {
      const { error: storyTagError } = await supabase.from("story_tags").insert({ story_id: storyId, tag_id: tagId })

      if (storyTagError) {
        console.error("Error al relacionar historia con etiqueta:", storyTagError)
        return { success: false, error: storyTagError.message }
      }
    }

    revalidatePath("/")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error in submitStory action:", error)
    return { success: false, error: "Failed to submit story" }
  }
}

// Añadir la función upvoteStory que faltaba
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
    const { data: existingVote, error: checkError } = await supabase
      .from("upvotes")
      .select("*")
      .eq("story_id", storyId)
      .eq("user_id", userId)
      .maybeSingle() // Usar maybeSingle en lugar de single

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error al verificar voto existente:", checkError)
      return { success: false, error: checkError.message }
    }

    // Si el usuario ya votó, no hacer nada
    if (existingVote) {
      return { success: true, alreadyVoted: true }
    }

    // Insertar el voto
    const { error: insertError } = await supabase.from("upvotes").insert({
      story_id: storyId,
      user_id: userId,
    })

    if (insertError) {
      console.error("Error al registrar voto:", insertError)
      return { success: false, error: insertError.message }
    }

    // Incrementar el contador de votos en la historia
    const { data: updatedStory, error: updateError } = await supabase
      .rpc("increment_story_upvotes", { story_id: storyId })
      .maybeSingle()

    if (updateError) {
      console.error("Error al incrementar contador de votos:", updateError)
      // No revertimos la inserción del voto, pero registramos el error
    }

    // Obtener el nuevo contador de votos
    const { data: story, error: fetchError } = await supabase
      .from("stories")
      .select("upvotes")
      .eq("id", storyId)
      .maybeSingle() // Usar maybeSingle en lugar de single

    if (fetchError) {
      console.error("Error al obtener contador actualizado:", fetchError)
    }

    // Revalidar las rutas para que se actualicen los datos
    revalidatePath("/")
    revalidatePath(`/story/${storyId}`)

    return {
      success: true,
      newUpvoteCount: story?.upvotes || null,
    }
  } catch (error) {
    console.error("Error in upvoteStory action:", error)
    return { success: false, error: "Error al procesar el voto" }
  }
}

// Añadir la función upvoteComment que también podría faltar
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
      .maybeSingle()

    if (checkError) {
      console.error("Error al verificar voto existente:", checkError)
      return { success: false, error: checkError.message }
    }

    // Si el usuario ya votó, no hacer nada
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
      console.error("Error al obtener contador actual:", fetchError)
      return { success: false, error: fetchError.message }
    }

    // Calcular el nuevo valor de upvotes
    const currentUpvotes = currentComment?.upvotes || 0
    const newUpvotes = currentUpvotes + 1

    // Registrar el voto del usuario
    const { error: insertError } = await supabase.from("comment_upvotes").insert({
      comment_id: commentId,
      user_id: userId,
    })

    if (insertError) {
      console.error("Error al registrar voto:", insertError)
      return { success: false, error: insertError.message }
    }

    // Incrementar el contador de votos
    const { error: updateError } = await supabase.from("comments").update({ upvotes: newUpvotes }).eq("id", commentId)

    if (updateError) {
      console.error("Error al actualizar contador:", updateError)
      // Intentar revertir la inserción del voto
      await supabase.from("comment_upvotes").delete().eq("comment_id", commentId).eq("user_id", userId)
      return { success: false, error: updateError.message }
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

// Añadir otras funciones que podrían faltar
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
      updateData.display_name = sanitizeHtml(displayName)
    }
    if (bio !== undefined) {
      updateData.bio = sanitizeHtml(bio)
    }
    if (website !== undefined) {
      updateData.website = sanitizeHtml(website)
    }

    if (regenerateUsername) {
      const username = await generateUniqueUsername(supabase)
      updateData.username = username
    }

    const { error } = await supabase.from("profiles").update(updateData).eq("id", userId)

    if (error) {
      console.error("Error updating profile:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    console.error("Error in updateProfile action:", error)
    return { success: false, error: "Failed to update profile" }
  }
}

// Funciones de administración
export async function approveStory(storyId: string) {
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

export async function rejectStory(storyId: string) {
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

export async function improveStoryWithAI(content: string) {
  try {
    // Verificar que estamos en el servidor
    if (typeof window !== "undefined") {
      console.error("improveStoryWithAI debe ser llamada solo desde el servidor")
      return { success: false, error: "Esta función solo puede ejecutarse en el servidor" }
    }

    // Verificar que tenemos una API key
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY no está configurada")
      return { success: false, error: "API key no configurada" }
    }

    // Verificar que tenemos contenido
    if (!content) {
      console.error("No se proporcionó contenido para mejorar")
      return { success: false, error: "Contenido no proporcionado" }
    }

    console.log("Enviando solicitud a la API de OpenAI...")

    // Construir la URL absoluta para la API route
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https"
    const host = process.env.NEXT_PUBLIC_VERCEL_URL || "localhost:3000"
    const baseUrl = `${protocol}://${host}`

    // Obtener las cookies para pasarlas a la solicitud
    const cookieStore = cookies()
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ")

    // Usar nuestra API Route para mejorar el contenido
    const response = await fetch(`${baseUrl}/api/admin/improve-content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader, // Pasar las cookies para mantener la sesión
      },
      body: JSON.stringify({ content }),
      cache: "no-store",
      credentials: "include", // Importante para incluir cookies
    })

    // Manejar errores de la respuesta
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
      console.error("Error en la respuesta de la API:", data.error)
      return { success: false, error: data.error || "Error al mejorar el contenido" }
    }

    console.log("Contenido mejorado recibido correctamente")
    return { success: true, improvedContent: data.improvedContent }
  } catch (error) {
    console.error("Error en improveStoryWithAI:", error)
    return { success: false, error: error instanceof Error ? error.message : "Error al mejorar el contenido con IA" }
  }
}

export async function getAppStats() {
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
      supabase.from("upvotes").select("id", { count: "exact" }),
    ])

    const stats = {
      totalStories: totalStoriesResult.count || 0,
      pendingStories: pendingStoriesResult.count || 0,
      publishedStories: publishedStoriesResult.count || 0,
      totalComments: totalCommentsResult.count || 0,
      totalUsers: totalUsersResult.count || 0,
      newUsers: newUsersResult.count || 0,
      totalUpvotes: totalUpvotesResult.count || 0,
    }

    return { success: true, stats }
  } catch (error) {
    console.error("Error in getAppStats action:", error)
    return { success: false, error: "Failed to get app stats" }
  }
}

export async function adminDeleteComment(commentId: string) {
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

export async function adminRejectStory(storyId: string) {
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
