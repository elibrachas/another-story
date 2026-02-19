"use server"

import { createServerClient } from "@supabase/ssr"
import type { User } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sanitizeContent, sanitizeText } from "@/lib/sanitize"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { generateUsername } from "@/lib/username-generator"

function createServerActionClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component - ignore cookie setting errors
          }
        },
      },
    }
  )
}

type AuthUserResult = {
  user: User | null
  error: string | null
}

async function getAuthenticatedUser(supabase: ReturnType<typeof createServerActionClient>): Promise<AuthUserResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (user) {
    return { user, error: null }
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (session?.user) {
    return { user: session.user, error: null }
  }

  return { user: null, error: userError?.message ?? sessionError?.message ?? null }
}

export async function createInitialProfile() {
  const supabase = createServerActionClient()

  try {
    console.log("Iniciando createInitialProfile...")

    const { user, error: authError } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      console.log("No hay sesión activa")
      return { success: false, error: "No session found" }
    }

    const userId = user.id

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
    const username = await generateUsername()
    console.log("Nombre de usuario generado:", username)

    // Crear el perfil inicial
    try {
      console.log("Creando perfil inicial...")
      const { data: newProfile, error } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          username: username,
          admin: false,
          country: "XX", // Establecer el país del usuario
        })
        .select()
        .single()

      if (error) {
        // Si el error es de clave duplicada, significa que el perfil ya fue creado
        if (error.code === "23505") {
          console.log("El perfil ya fue creado por otra solicitud")
          const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", userId).single()
          return { success: true, profile: existingProfile, message: "Profile already exists" }
        }

        console.error("Error al crear perfil inicial:", error)
        return { success: false, error: error.message }
      }

      console.log("Perfil creado exitosamente:", newProfile)
      return { success: true, profile: newProfile }
    } catch (error) {
      console.error("Error en la creación del perfil:", error)
      return { success: false, error: error instanceof Error ? error.message : "Error desconocido" }
    }
  } catch (error) {
    console.error("Error en createInitialProfile:", error)
    return { success: false, error: error instanceof Error ? error.message : "Error desconocido" }
  }
}

export async function submitComment(formData: FormData) {
  try {
    const supabase = createServerActionClient()

    // Obtener el usuario actual
    const { user, error: authError } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return {
        success: false,
        error: "Debes estar autenticado para comentar",
      }
    }

    const storyId = formData.get("storyId") as string
    const content = formData.get("content") as string

    // Validaciones
    if (!content || content.trim().length < 10) {
      return {
        success: false,
        error: "El comentario debe tener al menos 10 caracteres",
      }
    }

    // Obtener datos del perfil para el autor
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username, display_name")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("Error fetching profile for comment:", profileError)
    }

    const rawAuthorName = profile?.display_name?.trim() || profile?.username?.trim() || "Anónimo"
    const sanitizedAuthor = sanitizeText(rawAuthorName) || "Anónimo"
    const sanitizedDisplayName = profile?.display_name ? sanitizeText(profile.display_name.trim()) : null

    // Sanitizar contenido
    const sanitizedContent = sanitizeContent(content.trim())

    // Insertar el comentario
    const { error: commentError } = await supabase.from("comments").insert({
      story_id: storyId,
      content: sanitizedContent,
      user_id: user.id,
      author: sanitizedAuthor,
      display_name: sanitizedDisplayName,
      approved: false, // Los comentarios requieren aprobación
    })

    if (commentError) {
      console.error("Error inserting comment:", commentError)
      return {
        success: false,
        error: "Error al guardar el comentario",
      }
    }

    return {
      success: true,
      error: null,
    }
  } catch (error) {
    console.error("Error in submitComment:", error)
    return {
      success: false,
      error: "Error inesperado al enviar el comentario",
    }
  }
}

export async function submitStory(formData: FormData) {
  try {
    const supabase = createServerActionClient()

    // Obtener el usuario actual
    const { user, error: authError } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return {
        success: false,
        error: "Debes estar autenticado para enviar una historia",
      }
    }

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const industry = formData.get("industry") as string
    const tagsJson = formData.get("tags") as string

    // Validaciones
    if (!title || title.trim().length < 5) {
      return {
        success: false,
        error: "El título debe tener al menos 5 caracteres",
      }
    }

    if (!industry || industry.trim().length === 0) {
      return {
        success: false,
        error: "La industria es obligatoria",
      }
    }

    if (!content || content.trim().length < 50) {
      return {
        success: false,
        error: "La historia debe tener al menos 50 caracteres",
      }
    }

    // Obtener datos del perfil para el autor
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username, display_name")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("Error fetching profile for story:", profileError)
    }

    const rawAuthorName = profile?.display_name?.trim() || profile?.username?.trim() || "Anónimo"
    const sanitizedAuthor = sanitizeText(rawAuthorName) || "Anónimo"
    const sanitizedDisplayName = profile?.display_name ? sanitizeText(profile.display_name.trim()) : null

    // Sanitizar contenido
    const sanitizedTitle = sanitizeText(title.trim())
    const sanitizedContent = sanitizeContent(content.trim())
    const sanitizedIndustry = sanitizeText(industry.trim())

    // Parsear etiquetas
    let tags: string[] = []
    try {
      tags = JSON.parse(tagsJson || "[]")
    } catch (e) {
      tags = []
    }

    // Insertar la historia
    const { data: story, error: storyError } = await supabase
      .from("stories")
      .insert({
        title: sanitizedTitle,
        content: sanitizedContent,
        author: sanitizedAuthor,
        display_name: sanitizedDisplayName,
        industry: sanitizedIndustry,
        user_id: user.id,
        published: false, // Las historias requieren aprobación
      })
      .select()
      .single()

    if (storyError) {
      console.error("Error inserting story:", storyError)
      return {
        success: false,
        error: "Error al guardar la historia",
      }
    }

    // Insertar etiquetas si existen
    if (tags.length > 0 && story) {
      for (const tagName of tags) {
        const sanitizedTagName = sanitizeText(tagName.trim())
        if (sanitizedTagName) {
          // Buscar o crear la etiqueta
          let { data: tag, error: tagError } = await supabase
            .from("tags")
            .select("id")
            .eq("name", sanitizedTagName)
            .single()

          if (tagError && tagError.code === "PGRST116") {
            // La etiqueta no existe, crearla
            const { data: newTag, error: createTagError } = await supabase
              .from("tags")
              .insert({ name: sanitizedTagName })
              .select()
              .single()

            if (createTagError) {
              console.error("Error creating tag:", createTagError)
              continue
            }
            tag = newTag
          }

          if (tag) {
            // Asociar la etiqueta con la historia
            await supabase.from("story_tags").insert({
              story_id: story.id,
              tag_id: tag.id,
            })
          }
        }
      }
    }

    return {
      success: true,
      error: null,
    }
  } catch (error) {
    console.error("Error in submitStory:", error)
    return {
      success: false,
      error: "Error inesperado al enviar la historia",
    }
  }
}

export async function upvoteStory(storyId: string) {
  try {
    const supabase = createServerActionClient()

    // Obtener el usuario actual
    const { user, error: authError } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return {
        success: false,
        error: "Debes estar autenticado para votar",
      }
    }

    // Verificar si ya votó
    const { data: existingVote } = await supabase
      .from("story_upvotes")
      .select("id")
      .eq("story_id", storyId)
      .eq("user_id", user.id)
      .single()

    if (existingVote) {
      // Remover voto
      const { error } = await supabase.from("story_upvotes").delete().eq("story_id", storyId).eq("user_id", user.id)

      if (error) {
        console.error("Error removing upvote:", error)
        return {
          success: false,
          error: "Error al remover el voto",
        }
      }

      return {
        success: true,
        action: "removed",
        error: null,
      }
    } else {
      // Agregar voto
      const { error } = await supabase.from("story_upvotes").insert({
        story_id: storyId,
        user_id: user.id,
      })

      if (error) {
        console.error("Error adding upvote:", error)
        return {
          success: false,
          error: "Error al agregar el voto",
        }
      }

      return {
        success: true,
        action: "added",
        error: null,
      }
    }
  } catch (error) {
    console.error("Error in upvoteStory:", error)
    return {
      success: false,
      error: "Error inesperado al votar",
    }
  }
}

export async function signInWithEmail(formData: FormData) {
  try {
    const supabase = createServerActionClient()

    const email = formData.get("email") as string

    if (!email) {
      return {
        success: false,
        error: "Email es requerido",
      }
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error("Error signing in:", error)
      return {
        success: false,
        error: "Error al enviar el enlace de acceso",
      }
    }

    return {
      success: true,
      error: null,
    }
  } catch (error) {
    console.error("Error in signInWithEmail:", error)
    return {
      success: false,
      error: "Error inesperado al iniciar sesión",
    }
  }
}

export async function signOut() {
  try {
    const supabase = createServerActionClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Error signing out:", error)
      return {
        success: false,
        error: "Error al cerrar sesión",
      }
    }

    // Limpiar cookies
    const cookieStore = cookies()
    cookieStore.delete("sb-access-token")
    cookieStore.delete("sb-refresh-token")

    return {
      success: true,
      error: null,
    }
  } catch (error) {
    console.error("Error in signOut:", error)
    return {
      success: false,
      error: "Error inesperado al cerrar sesión",
    }
  }
}

export async function improveStoryWithAI(content: string) {
  try {
    if (!content || content.trim().length === 0) {
      return {
        success: false,
        error: "El contenido no puede estar vacío",
      }
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/improve-content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: content.trim() }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Error desconocido en la API")
    }

    return {
      success: true,
      improvedContent: result.improvedContent,
      error: null,
    }
  } catch (error) {
    console.error("Error in improveStoryWithAI:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error inesperado al mejorar el contenido",
    }
  }
}

export async function upvoteComment(commentId: string) {
  try {
    const supabase = createServerActionClient()

    // Obtener el usuario actual
    const { user, error: authError } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return {
        success: false,
        error: "Debes estar autenticado para votar",
      }
    }

    // Verificar si ya votó
    const { data: existingVote } = await supabase
      .from("comment_upvotes")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_id", user.id)
      .single()

    if (existingVote) {
      // Remover voto
      const { error } = await supabase
        .from("comment_upvotes")
        .delete()
        .eq("comment_id", commentId)
        .eq("user_id", user.id)

      if (error) {
        console.error("Error removing upvote:", error)
        return {
          success: false,
          error: "Error al remover el voto",
        }
      }

      return {
        success: true,
        action: "removed",
        error: null,
      }
    } else {
      // Agregar voto
      const { error } = await supabase.from("comment_upvotes").insert({
        comment_id: commentId,
        user_id: user.id,
      })

      if (error) {
        console.error("Error adding upvote:", error)
        return {
          success: false,
          error: "Error al agregar el voto",
        }
      }

      return {
        success: true,
        action: "added",
        error: null,
      }
    }
  } catch (error) {
    console.error("Error in upvoteComment:", error)
    return {
      success: false,
      error: "Error inesperado al votar",
    }
  }
}

export async function updateProfile(formData: FormData) {
  try {
    const supabase = createServerActionClient()

    // Obtener el usuario actual
    const { user, error: authError } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return { success: false, error: "Debes iniciar sesión" }
    }

    // Obtener datos del formulario
    const displayName = formData.get("displayName") as string
    const username = formData.get("username") as string

    // Validar datos
    if (!displayName || !username) {
      return { success: false, error: "Nombre y nombre de usuario son requeridos" }
    }

    // Verificar si el nombre de usuario ya existe (excluyendo el usuario actual)
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", user.id)
      .single()

    if (existingUser) {
      return { success: false, error: "El nombre de usuario ya está en uso" }
    }

    // Actualizar perfil
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        username: username,
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error al actualizar perfil:", updateError)
      return { success: false, error: "Error al actualizar el perfil" }
    }

    redirect("/profile")
    return { success: true }
  } catch (error) {
    console.error("Error inesperado al actualizar perfil:", error)
    return { success: false, error: "Error inesperado al actualizar el perfil" }
  }
}

export async function createProfile(userId: string, email: string) {
  try {
    // Generar un nombre de usuario único
    const username = await generateUsername()

    // Crear el perfil usando el cliente admin
    const { error } = await supabaseAdmin.from("profiles").insert({
      id: userId,
      username,
      display_name: email.split("@")[0], // Usar la parte antes del @ como nombre inicial
      email,
    })

    if (error) {
      console.error("Error al crear perfil:", error)
      throw error
    }

    return { success: true, username }
  } catch (error) {
    console.error("Error inesperado al crear perfil:", error)
    throw error
  }
}

export async function searchStories(query: string) {
  try {
    const supabase = createServerActionClient()

    if (!query || query.trim().length < 2) {
      return []
    }

    const searchQuery = query.trim().toLowerCase()

    // Buscar en títulos y contenido
    const { data: stories, error } = await supabase
      .from("stories")
      .select("*")
      .eq("published", true)
      .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("Error al buscar historias:", error)
      return []
    }

    return stories || []
  } catch (error) {
    console.error("Error inesperado al buscar historias:", error)
    return []
  }
}

// Funciones de administración
export async function approveStory(storyId: string) {
  const supabase = createServerActionClient()

  try {
    // Verificar si el usuario es administrador
    const { user, error: authError } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return { success: false, error: "No autenticado" }
    }

    const { data: profileData } = await supabase.from("profiles").select("admin").eq("id", user.id).single()

    if (!profileData?.admin) {
      return { success: false, error: "No tienes permisos de administrador" }
    }

    const { error } = await supabase.from("stories").update({ published: true }).eq("id", storyId)

    if (error) {
      console.error("Error approving story:", error)
      return { success: false, error: error.message }
    }

    redirect("/admin")
    redirect("/")
    return { success: true }
  } catch (error) {
    console.error("Error in approveStory action:", error)
    return { success: false, error: "Failed to approve story" }
  }
}

export async function rejectStory(storyId: string) {
  const supabase = createServerActionClient()

  try {
    // Verificar si el usuario es administrador
    const { user, error: authError } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return { success: false, error: "No autenticado" }
    }

    const { data: profileData } = await supabase.from("profiles").select("admin").eq("id", user.id).single()

    if (!profileData?.admin) {
      return { success: false, error: "No tienes permisos de administrador" }
    }

    const { error } = await supabase.from("stories").delete().eq("id", storyId)

    if (error) {
      console.error("Error rejecting story:", error)
      return { success: false, error: error.message }
    }

    redirect("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error in rejectStory action:", error)
    return { success: false, error: "Failed to reject story" }
  }
}

export async function adminDeleteComment(commentId: string) {
  const supabase = createServerActionClient()

  try {
    // Verificar si el usuario es administrador
    const { user, error: authError } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return { success: false, error: "No autenticado" }
    }

    const { data: profileData } = await supabase.from("profiles").select("admin").eq("id", user.id).single()

    if (!profileData?.admin) {
      return { success: false, error: "No tienes permisos de administrador" }
    }

    const { error } = await supabase.from("comments").delete().eq("id", commentId)

    if (error) {
      console.error("Error deleting comment:", error)
      return { success: false, error: error.message }
    }

    redirect("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error in adminDeleteComment action:", error)
    return { success: false, error: "Failed to delete comment" }
  }
}

export async function adminRejectStory(storyId: string) {
  const supabase = createServerActionClient()

  try {
    // Verificar si el usuario es administrador
    const { user, error: authError } = await getAuthenticatedUser(supabase)

    if (authError || !user) {
      return { success: false, error: "No autenticado" }
    }

    const { data: profileData } = await supabase.from("profiles").select("admin").eq("id", user.id).single()

    if (!profileData?.admin) {
      return { success: false, error: "No tienes permisos de administrador" }
    }

    const { error } = await supabase.from("stories").delete().eq("id", storyId)

    if (error) {
      console.error("Error rejecting story:", error)
      return { success: false, error: error.message }
    }

    redirect("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error in adminRejectStory action:", error)
    return { success: false, error: "Failed to reject story" }
  }
}

export async function getAppStats() {
  try {
    // Get total published stories count
    const { count: publishedStoriesCount, error: storiesError } = await supabaseAdmin
      .from("stories")
      .select("*", { count: "exact", head: true })
      .eq("published", true)

    // Get total pending stories count
    const { count: pendingStoriesCount, error: pendingError } = await supabaseAdmin
      .from("stories")
      .select("*", { count: "exact", head: true })
      .eq("published", false)

    // Get total comments count
    const { count: commentsCount, error: commentsError } = await supabaseAdmin
      .from("comments")
      .select("*", { count: "exact", head: true })

    // Get total users count
    const { count: usersCount, error: usersError } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })

    // Get total upvotes count
    const { count: upvotesCount, error: upvotesError } = await supabaseAdmin
      .from("story_upvotes")
      .select("*", { count: "exact", head: true })

    if (storiesError || pendingError || commentsError || usersError || upvotesError) {
      console.error("Error fetching stats:", { storiesError, pendingError, commentsError, usersError, upvotesError })
      return {
        publishedStories: 0,
        pendingStories: 0,
        comments: 0,
        users: 0,
        upvotes: 0,
      }
    }

    return {
      publishedStories: publishedStoriesCount || 0,
      pendingStories: pendingStoriesCount || 0,
      comments: commentsCount || 0,
      users: usersCount || 0,
      upvotes: upvotesCount || 0,
    }
  } catch (error) {
    console.error("Error in getAppStats:", error)
    return {
      publishedStories: 0,
      pendingStories: 0,
      comments: 0,
      users: 0,
      upvotes: 0,
    }
  }
}
