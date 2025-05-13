"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { generateUsername } from "@/lib/username-generator"
import type { Story } from "@/lib/types"

export async function submitStory(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    // Verificar si el usuario está autenticado
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Debes iniciar sesión para enviar una historia" }
    }

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const industry = formData.get("industry") as string
    const anonymous = formData.get("anonymous") === "on"
    const tagIds = formData.getAll("tags") as string[]

    // Validar campos obligatorios
    if (!title.trim() || !content.trim() || !industry.trim()) {
      return { success: false, error: "Todos los campos son obligatorios" }
    }

    // Obtener el perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      console.error("Error al obtener perfil:", profileError)
      return { success: false, error: "Error al obtener información del usuario" }
    }

    // Si el usuario no tiene un perfil, crear uno
    if (!profile) {
      const username = generateUsername()

      const { error: insertProfileError } = await supabase.from("profiles").insert({
        id: session.user.id,
        username,
        display_name: username,
      })

      if (insertProfileError) {
        console.error("Error al crear perfil:", insertProfileError)
        return { success: false, error: "Error al crear perfil de usuario" }
      }
    }

    // Insertar la historia
    const { data: story, error: storyError } = await supabase
      .from("stories")
      .insert({
        title,
        content,
        industry,
        author: session.user.id,
        anonymous,
        published: false, // Las historias requieren aprobación
      })
      .select()
      .single()

    if (storyError) {
      console.error("Error al insertar historia:", storyError)
      return { success: false, error: "Error al guardar la historia" }
    }

    // Si hay etiquetas seleccionadas, asociarlas a la historia
    if (tagIds.length > 0) {
      const storyTags = tagIds.map((tagId) => ({
        story_id: story.id,
        tag_id: tagId,
      }))

      const { error: tagError } = await supabase.from("story_tags").insert(storyTags)

      if (tagError) {
        console.error("Error al asociar etiquetas:", tagError)
        // No retornamos error aquí, la historia ya se guardó
      }
    }

    // Registrar la acción en los logs de administración
    await supabase.from("admin_logs").insert({
      action: "story_submitted",
      user_id: session.user.id,
      details: { story_id: story.id, title },
    })

    revalidatePath("/")
    return { success: true, storyId: story.id }
  } catch (error) {
    console.error("Error al enviar historia:", error)
    return { success: false, error: "Error al procesar la solicitud" }
  }
}

export async function upvoteStory(storyId: string) {
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

    // Verificar si el usuario ya ha votado por esta historia
    const { data: existingUpvote, error: checkError } = await supabase
      .from("upvotes")
      .select("*")
      .eq("story_id", storyId)
      .eq("user_id", userId)
      .maybeSingle()

    if (checkError) {
      console.error("Error al verificar upvote:", checkError)
      return { success: false, error: "Error al verificar voto" }
    }

    if (existingUpvote) {
      return { success: false, error: "Ya has votado por esta historia" }
    }

    // Insertar el upvote
    const { error: insertError } = await supabase.from("upvotes").insert({
      story_id: storyId,
      user_id: userId,
    })

    if (insertError) {
      console.error("Error al insertar upvote:", insertError)
      return { success: false, error: "Error al registrar voto" }
    }

    // Obtener el nuevo recuento de upvotes
    const { data: story, error: storyError } = await supabase
      .from("stories")
      .select("upvotes")
      .eq("id", storyId)
      .single()

    if (storyError) {
      console.error("Error al obtener recuento de upvotes:", storyError)
      // No retornamos error aquí, el upvote ya se registró
      return { success: true, newUpvoteCount: null }
    }

    revalidatePath(`/story/${storyId}`)
    revalidatePath("/")

    return { success: true, newUpvoteCount: story.upvotes }
  } catch (error) {
    console.error("Error al procesar upvote:", error)
    return { success: false, error: "Error al procesar la solicitud" }
  }
}

export async function getStoryById(id: string): Promise<Story | null> {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { data, error } = await supabase
      .from("stories")
      .select(`
        *,
        profiles:author (username, display_name),
        tags:story_tags (
          tags:tag_id (
            id,
            name,
            color
          )
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error al obtener historia:", error)
      return null
    }

    // Transformar los datos para que coincidan con el tipo Story
    const story: Story = {
      ...data,
      tags: data.tags.map((tag: any) => tag.tags),
      author: data.profiles.username,
      display_name: data.profiles.display_name,
    }

    return story
  } catch (error) {
    console.error("Error al obtener historia:", error)
    return null
  }
}

export async function getStories(): Promise<Story[]> {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { data, error } = await supabase
      .from("stories")
      .select(`
        *,
        profiles:author (username, display_name),
        tags:story_tags (
          tags:tag_id (
            id,
            name,
            color
          )
        )
      `)
      .eq("published", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error al obtener historias:", error)
      return []
    }

    // Transformar los datos para que coincidan con el tipo Story
    const stories: Story[] = data.map((story: any) => ({
      ...story,
      tags: story.tags.map((tag: any) => tag.tags),
      author: story.profiles.username,
      display_name: story.profiles.display_name,
    }))

    return stories
  } catch (error) {
    console.error("Error al obtener historias:", error)
    return []
  }
}

export async function searchStories(query: string): Promise<Story[]> {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { data, error } = await supabase
      .from("stories")
      .select(`
        *,
        profiles:author (username, display_name),
        tags:story_tags (
          tags:tag_id (
            id,
            name,
            color
          )
        )
      `)
      .eq("published", true)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,industry.ilike.%${query}%`)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error al buscar historias:", error)
      return []
    }

    // Transformar los datos para que coincidan con el tipo Story
    const stories: Story[] = data.map((story: any) => ({
      ...story,
      tags: story.tags.map((tag: any) => tag.tags),
      author: story.profiles.username,
      display_name: story.profiles.display_name,
    }))

    return stories
  } catch (error) {
    console.error("Error al buscar historias:", error)
    return []
  }
}

export async function getStoriesByTag(tagId: string): Promise<Story[]> {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  try {
    const { data, error } = await supabase
      .from("story_tags")
      .select(`
        stories:story_id (
          *,
          profiles:author (username, display_name),
          tags:story_tags (
            tags:tag_id (
              id,
              name,
              color
            )
          )
        )
      `)
      .eq("tag_id", tagId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error al obtener historias por etiqueta:", error)
      return []
    }

    // Filtrar historias publicadas y transformar los datos
    const stories: Story[] = data
      .map((item: any) => item.stories)
      .filter((story: any) => story.published)
      .map((story: any) => ({
        ...story,
        tags: story.tags.map((tag: any) => tag.tags),
        author: story.profiles.username,
        display_name: story.profiles.display_name,
      }))

    return stories
  } catch (error) {
    console.error("Error al obtener historias por etiqueta:", error)
    return []
  }
}
