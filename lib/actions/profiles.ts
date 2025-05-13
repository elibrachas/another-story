"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Verificar si el usuario está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Debes iniciar sesión para actualizar tu perfil" }
    }

    const displayName = formData.get("displayName") as string
    const bio = formData.get("bio") as string

    // Validar campos
    if (!displayName.trim()) {
      return { success: false, error: "El nombre de visualización es obligatorio" }
    }

    // Actualizar el perfil
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
        bio: bio ? bio.trim() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)

    if (error) {
      console.error("Error al actualizar perfil:", error)
      return { success: false, error: "Error al actualizar el perfil" }
    }

    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    console.error("Error al actualizar perfil:", error)
    return { success: false, error: "Error al procesar la solicitud" }
  }
}

export async function getUserProfile() {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Verificar si el usuario está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "No hay sesión activa" }
    }

    // Obtener el perfil del usuario
    const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    if (error) {
      console.error("Error al obtener perfil:", error)
      return { success: false, error: "Error al obtener el perfil" }
    }

    return { success: true, profile: data }
  } catch (error) {
    console.error("Error al obtener perfil:", error)
    return { success: false, error: "Error al procesar la solicitud" }
  }
}

export async function getUserStories() {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Verificar si el usuario está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "No hay sesión activa" }
    }

    // Obtener las historias del usuario
    const { data, error } = await supabase
      .from("stories")
      .select(`
        *,
        tags:story_tags (
          tags:tag_id (
            id,
            name,
            color
          )
        )
      `)
      .eq("author", session.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error al obtener historias:", error)
      return { success: false, error: "Error al obtener las historias" }
    }

    // Transformar los datos
    const stories = data.map((story) => ({
      ...story,
      tags: story.tags.map((tag: any) => tag.tags),
    }))

    return { success: true, stories }
  } catch (error) {
    console.error("Error al obtener historias:", error)
    return { success: false, error: "Error al procesar la solicitud" }
  }
}

export async function getUserComments() {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Verificar si el usuario está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "No hay sesión activa" }
    }

    // Obtener los comentarios del usuario
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        stories:story_id (
          id,
          title
        )
      `)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error al obtener comentarios:", error)
      return { success: false, error: "Error al obtener los comentarios" }
    }

    return { success: true, comments: data }
  } catch (error) {
    console.error("Error al obtener comentarios:", error)
    return { success: false, error: "Error al procesar la solicitud" }
  }
}
