"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { generateUniqueUsername } from "./username-generator"
import { isAuthorizedAdmin } from "./admin-utils"

type StorySubmission = {
  title: string
  content: string
  industry: string
  isAnonymous: boolean
  tags: string[]
  customTags?: string[]
}

type CommentSubmission = {
  storyId: string
  content: string
  isAnonymous: boolean
}

type ProfileUpdate = {
  displayName?: string
  bio?: string
  website?: string
  regenerateUsername?: boolean
}

export async function submitStory(data: StorySubmission) {
  const supabase = createServerActionClient({ cookies })

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    throw new Error("No autenticado")
  }

  // Obtener el perfil del usuario para usar su nombre de usuario
  const { data: profile } = await supabase.from("profiles").select("username").eq("id", userData.user.id).single()

  // Insertar la historia
  const { data: story, error } = await supabase
    .from("stories")
    .insert({
      title: data.title,
      content: data.content,
      industry: data.industry,
      author: data.isAnonymous ? "Anónimo" : profile?.username || userData.user.email,
      user_id: userData.user.id,
      published: false, // Requiere aprobación del administrador
      upvotes: 0,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  // Procesar etiquetas personalizadas
  const customTagIds: string[] = []
  if (data.customTags && data.customTags.length > 0) {
    for (const tagName of data.customTags) {
      // Verificar si la etiqueta ya existe
      const { data: existingTag } = await supabase.from("tags").select("id").eq("name", tagName).single()

      if (existingTag) {
        // Si la etiqueta ya existe, usar su ID
        customTagIds.push(existingTag.id)
      } else {
        // Si no existe, crear una nueva etiqueta
        const { data: newTag, error: tagError } = await supabase
          .from("tags")
          .insert({ name: tagName })
          .select()
          .single()

        if (tagError) {
          console.error("Error al crear etiqueta personalizada:", tagError)
        } else if (newTag) {
          customTagIds.push(newTag.id)
        }
      }
    }
  }

  // Combinar etiquetas existentes y personalizadas
  const allTagIds = [...data.tags, ...customTagIds]

  // Insertar las etiquetas de la historia
  if (allTagIds.length > 0) {
    const storyTags = allTagIds.map((tagId) => ({
      story_id: story.id,
      tag_id: tagId,
    }))

    const { error: tagError } = await supabase.from("story_tags").insert(storyTags)

    if (tagError) {
      throw new Error(tagError.message)
    }
  }

  revalidatePath("/")
}

export async function upvoteStory(storyId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    throw new Error("No autenticado")
  }

  // Verificar si el usuario ya ha votado
  const { data: existingUpvote } = await supabase
    .from("upvotes")
    .select()
    .eq("user_id", userData.user.id)
    .eq("story_id", storyId)
    .single()

  if (existingUpvote) {
    throw new Error("Ya has votado")
  }

  // Añadir registro de voto
  const { error: upvoteError } = await supabase.from("upvotes").insert({
    user_id: userData.user.id,
    story_id: storyId,
  })

  if (upvoteError) {
    throw new Error(upvoteError.message)
  }

  // Incrementar el contador de votos de la historia
  const { error: storyError } = await supabase.rpc("increment_upvotes", {
    story_id: storyId,
  })

  if (storyError) {
    throw new Error(storyError.message)
  }

  revalidatePath("/")
  revalidatePath(`/story/${storyId}`)
}

export async function approveStory(storyId: string) {
  const supabase = createServerActionClient({ cookies })

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      console.error("Error de autenticación:", userError)
      throw new Error("No autenticado")
    }

    // Verificar si el usuario es administrador
    if (!isAuthorizedAdmin(userData.user.email)) {
      console.error("Usuario no autorizado:", userData.user.email)
      throw new Error("No autorizado")
    }

    console.log(`Intentando aprobar historia con ID: ${storyId}`)

    // Actualizar el estado de la historia a publicada
    const { data, error } = await supabase
      .from("stories")
      .update({ published: true })
      .eq("id", storyId)
      .select()
      .single()

    if (error) {
      console.error("Error al aprobar historia:", error)
      throw new Error(`Error al aprobar historia: ${error.message}`)
    }

    if (!data) {
      console.error("No se encontró la historia o no se actualizó")
      throw new Error("No se encontró la historia o no se actualizó")
    }

    console.log(`Historia aprobada exitosamente: ${data.id}`)

    // Forzar la revalidación de las rutas
    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath(`/story/${storyId}`)

    return { success: true, data }
  } catch (error) {
    console.error("Error en approveStory:", error)
    throw error
  }
}

export async function rejectStory(storyId: string) {
  const supabase = createServerActionClient({ cookies })

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      console.error("Error de autenticación:", userError)
      throw new Error("No autenticado")
    }

    // Verificar si el usuario es administrador
    if (!isAuthorizedAdmin(userData.user.email)) {
      console.error("Usuario no autorizado:", userData.user.email)
      throw new Error("No autorizado")
    }

    console.log(`Intentando rechazar historia con ID: ${storyId}`)

    const { error } = await supabase.from("stories").delete().eq("id", storyId)

    if (error) {
      console.error("Error al rechazar historia:", error)
      throw new Error(`Error al rechazar historia: ${error.message}`)
    }

    console.log(`Historia rechazada exitosamente: ${storyId}`)

    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error en rejectStory:", error)
    throw error
  }
}

export async function submitComment(data: CommentSubmission) {
  const supabase = createServerActionClient({ cookies })

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    throw new Error("No autenticado")
  }

  // Obtener el perfil del usuario para usar su nombre de usuario
  const { data: profile } = await supabase.from("profiles").select("username").eq("id", userData.user.id).single()

  const { error } = await supabase.from("comments").insert({
    story_id: data.storyId,
    content: data.content,
    author: data.isAnonymous ? "Anónimo" : profile?.username || userData.user.email,
    user_id: userData.user.id,
    upvotes: 0,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/story/${data.storyId}`)
}

export async function upvoteComment(commentId: string, storyId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    throw new Error("No autenticado")
  }

  // Verificar si el usuario ya ha votado
  const { data: existingUpvote } = await supabase
    .from("comment_upvotes")
    .select()
    .eq("user_id", userData.user.id)
    .eq("comment_id", commentId)
    .single()

  if (existingUpvote) {
    throw new Error("Ya has votado")
  }

  // Añadir registro de voto
  const { error: upvoteError } = await supabase.from("comment_upvotes").insert({
    user_id: userData.user.id,
    comment_id: commentId,
  })

  if (upvoteError) {
    throw new Error(upvoteError.message)
  }

  // Incrementar el contador de votos del comentario
  const { error: commentError } = await supabase.rpc("increment_comment_upvotes", {
    comment_id: commentId,
  })

  if (commentError) {
    throw new Error(commentError.message)
  }

  revalidatePath(`/story/${storyId}`)
}

export async function updateProfile(data: ProfileUpdate) {
  const supabase = createServerActionClient({ cookies })

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    throw new Error("No autenticado")
  }

  const updates: any = {}

  if (data.displayName !== undefined) {
    updates.display_name = data.displayName
  }

  if (data.bio !== undefined) {
    updates.bio = data.bio
  }

  if (data.website !== undefined) {
    updates.website = data.website
  }

  if (data.regenerateUsername) {
    updates.username = await generateUniqueUsername(supabase)
  }

  updates.updated_at = new Date().toISOString()

  // Verificar si el perfil ya existe
  const { data: existingProfile } = await supabase.from("profiles").select().eq("id", userData.user.id).single()

  if (existingProfile) {
    // Actualizar perfil existente
    const { error } = await supabase.from("profiles").update(updates).eq("id", userData.user.id)

    if (error) throw error
  } else {
    // Crear nuevo perfil
    updates.id = userData.user.id
    updates.created_at = new Date().toISOString()

    // Si es un nuevo perfil y no se está regenerando el nombre de usuario, generarlo
    if (!updates.username) {
      updates.username = await generateUniqueUsername(supabase)
    }

    const { error } = await supabase.from("profiles").insert(updates)

    if (error) throw error
  }

  revalidatePath("/profile")
}

export async function createInitialProfile() {
  const supabase = createServerActionClient({ cookies })

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    return null
  }

  // Verificar si el perfil ya existe
  const { data: existingProfile } = await supabase.from("profiles").select().eq("id", userData.user.id).single()

  if (existingProfile) {
    return existingProfile
  }

  // Crear nuevo perfil con nombre de usuario generado
  const username = await generateUniqueUsername(supabase)

  const newProfile = {
    id: userData.user.id,
    username,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from("profiles").insert(newProfile).select().single()

  if (error) {
    console.error("Error al crear perfil inicial:", error)
    return null
  }

  return data
}

// Funciones de administración para comentarios
export async function approveComment(commentId: string) {
  const supabase = createServerActionClient({ cookies })

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      console.error("Error de autenticación:", userError)
      throw new Error("No autenticado")
    }

    // Verificar si el usuario es administrador
    if (!isAuthorizedAdmin(userData.user.email)) {
      console.error("Usuario no autorizado:", userData.user.email)
      throw new Error("No autorizado")
    }

    console.log(`Intentando aprobar comentario con ID: ${commentId}`)

    // Obtener información del comentario para revalidar la ruta correcta
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .select("story_id")
      .eq("id", commentId)
      .single()

    if (commentError) {
      console.error("Error al obtener información del comentario:", commentError)
      throw new Error(`Error al obtener información del comentario: ${commentError.message}`)
    }

    // Actualizar el comentario a aprobado
    const { data, error } = await supabase.from("comments").update({ approved: true }).eq("id", commentId).select()

    if (error) {
      console.error("Error al aprobar comentario:", error)
      throw new Error(`Error al aprobar comentario: ${error.message}`)
    }

    console.log(`Comentario aprobado exitosamente: ${commentId}`)

    // Revalidar rutas
    revalidatePath("/admin")
    if (comment?.story_id) {
      revalidatePath(`/story/${comment.story_id}`)
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error en approveComment:", error)
    throw error
  }
}

export async function rejectComment(commentId: string) {
  const supabase = createServerActionClient({ cookies })

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      console.error("Error de autenticación:", userError)
      throw new Error("No autenticado")
    }

    // Verificar si el usuario es administrador
    if (!isAuthorizedAdmin(userData.user.email)) {
      console.error("Usuario no autorizado:", userData.user.email)
      throw new Error("No autorizado")
    }

    console.log(`Intentando rechazar comentario con ID: ${commentId}`)

    // Obtener información del comentario para revalidar la ruta correcta
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .select("story_id")
      .eq("id", commentId)
      .single()

    if (commentError) {
      console.error("Error al obtener información del comentario:", commentError)
      throw new Error(`Error al obtener información del comentario: ${commentError.message}`)
    }

    // Eliminar el comentario
    const { error } = await supabase.from("comments").delete().eq("id", commentId)

    if (error) {
      console.error("Error al rechazar comentario:", error)
      throw new Error(`Error al rechazar comentario: ${error.message}`)
    }

    console.log(`Comentario rechazado exitosamente: ${commentId}`)

    // Revalidar rutas
    revalidatePath("/admin")
    if (comment?.story_id) {
      revalidatePath(`/story/${comment.story_id}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error en rejectComment:", error)
    throw error
  }
}

// Funciones de administración para usuarios
export async function banUser(userId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    throw new Error("No autenticado")
  }

  // Verificar si el usuario es administrador
  if (!isAuthorizedAdmin(userData.user.email)) {
    throw new Error("No autorizado")
  }

  // En un sistema real, actualizaríamos el campo 'is_banned' a true
  // Por ahora, simplemente simulamos la suspensión

  revalidatePath("/admin")
  return { success: true }
}

export async function unbanUser(userId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    throw new Error("No autenticado")
  }

  // Verificar si el usuario es administrador
  if (!isAuthorizedAdmin(userData.user.email)) {
    throw new Error("No autorizado")
  }

  // En un sistema real, actualizaríamos el campo 'is_banned' a false
  // Por ahora, simplemente simulamos la restauración

  revalidatePath("/admin")
  return { success: true }
}

export async function makeAdmin(userId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    throw new Error("No autenticado")
  }

  // Verificar si el usuario es administrador
  if (!isAuthorizedAdmin(userData.user.email)) {
    throw new Error("No autorizado")
  }

  // En un sistema real, actualizaríamos el campo 'is_admin' a true
  // Por ahora, simplemente simulamos la acción

  revalidatePath("/admin")
  return { success: true }
}

export async function removeAdmin(userId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    throw new Error("No autenticado")
  }

  // Verificar si el usuario es administrador
  if (!isAuthorizedAdmin(userData.user.email)) {
    throw new Error("No autorizado")
  }

  // En un sistema real, actualizaríamos el campo 'is_admin' a false
  // Por ahora, simplemente simulamos la acción

  revalidatePath("/admin")
  return { success: true }
}
