import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Story, Comment, Tag } from "./types"

export async function getStories() {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Obtener solo historias publicadas
    const { data: stories, error } = await supabase
      .from("stories")
      .select("*, story_tags(tag_id)")
      .eq("published", true)
      .eq("is_private", false)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error al obtener historias:", error)
      return []
    }

    if (!stories || stories.length === 0) return []

    // Obtener todas las etiquetas para las historias
    const storyIds = stories.map((story) => story.id)
    const { data: storyTags, error: tagsError } = await supabase
      .from("story_tags")
      .select("story_id, tags(*)")
      .in("story_id", storyIds)

    if (tagsError) {
      console.error("Error al obtener etiquetas:", tagsError)
    }

    // Agrupar etiquetas por historia
    const tagsByStory: Record<string, Tag[]> = {}
    storyTags?.forEach((item) => {
      if (!tagsByStory[item.story_id]) {
        tagsByStory[item.story_id] = []
      }
      tagsByStory[item.story_id].push(item.tags)
    })

    // Añadir etiquetas a cada historia
    const storiesWithTags = stories.map((story) => ({
      ...story,
      tags: tagsByStory[story.id] || [],
    }))

    return storiesWithTags as Story[]
  } catch (error) {
    console.error("Error inesperado al obtener historias:", error)
    return []
  }
}

export async function getStoryById(id: string) {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Usar maybeSingle en lugar de single para evitar errores 406
    const { data: story, error } = await supabase.from("stories").select("*").eq("id", id).maybeSingle()

    if (error) {
      console.error("Error al obtener historia:", error)
      return null
    }

    if (!story) return null

    // Obtener etiquetas para la historia
    const { data: storyTags, error: tagsError } = await supabase.from("story_tags").select("tags(*)").eq("story_id", id)

    if (tagsError) {
      console.error("Error al obtener etiquetas para historia:", tagsError)
    }

    const tags = storyTags?.map((item) => item.tags) || []

    return { ...story, tags } as Story
  } catch (error) {
    console.error("Error inesperado al obtener historia:", error)
    return null
  }
}

export async function getAdminStories() {
  const supabase = createServerComponentClient({ cookies })

  try {
    const { data: stories, error } = await supabase
      .from("stories")
      .select("*")
      .eq("published", false)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error al obtener historias de administración:", error)
      return []
    }

    return (stories as Story[]) || []
  } catch (error) {
    console.error("Error inesperado al obtener historias de administración:", error)
    return []
  }
}

export async function getCommentsByStoryId(storyId: string) {
  const supabase = createServerComponentClient({ cookies })

  try {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("story_id", storyId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error al obtener comentarios:", error)
      return []
    }

    return (data as Comment[]) || []
  } catch (error) {
    console.error("Error inesperado al obtener comentarios:", error)
    return []
  }
}

export async function getAllTags() {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Obtener todas las etiquetas
    const { data: tags, error } = await supabase.from("tags").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Error al obtener etiquetas:", error)
      return []
    }

    if (!tags || tags.length === 0) return []

    // En lugar de hacer consultas individuales para cada etiqueta,
    // vamos a hacer una sola consulta para obtener todos los story_tags
    // y luego calcular los recuentos en memoria
    const { data: allStoryTags, error: storyTagsError } = await supabase
      .from("story_tags")
      .select("tag_id, story_id, stories!inner(published, is_private)")
      .eq("stories.published", true)
      .eq("stories.is_private", false)

    if (storyTagsError) {
      console.error("Error al obtener story_tags:", storyTagsError)
      // Continuar con recuentos en 0 si hay error
    }

    // Calcular recuentos en memoria
    const tagCounts: Record<string, number> = {}

    // Inicializar todos los recuentos en 0
    tags.forEach((tag) => {
      tagCounts[tag.id] = 0
    })

    // Contar las apariciones de cada etiqueta
    if (allStoryTags) {
      allStoryTags.forEach((item) => {
        if (tagCounts[item.tag_id] !== undefined) {
          tagCounts[item.tag_id]++
        }
      })
    }

    // Añadir el recuento a cada etiqueta
    const tagsWithCount = tags.map((tag) => ({
      ...tag,
      count: tagCounts[tag.id] || 0,
    }))

    // Ordenar por recuento (más populares primero)
    return tagsWithCount.sort((a, b) => (b.count || 0) - (a.count || 0)) as Tag[]
  } catch (error) {
    console.error("Error inesperado al obtener todas las etiquetas:", error)
    return []
  }
}

export async function getStoriesByTag(tagId: string) {
  const supabase = createServerComponentClient({ cookies })

  try {
    const { data: storyTags, error: storyTagsError } = await supabase
      .from("story_tags")
      .select("story_id")
      .eq("tag_id", tagId)

    if (storyTagsError) {
      console.error("Error al obtener story_tags por etiqueta:", storyTagsError)
      return []
    }

    if (!storyTags || storyTags.length === 0) return []

    const storyIds = storyTags.map((item) => item.story_id)

    const { data: stories, error: storiesError } = await supabase
      .from("stories")
      .select("*")
      .in("id", storyIds)
      .eq("published", true)
      .eq("is_private", false)
      .order("created_at", { ascending: false })

    if (storiesError) {
      console.error("Error al obtener historias por etiqueta:", storiesError)
      return []
    }

    if (!stories || stories.length === 0) return []

    // Obtener todas las etiquetas para las historias
    const { data: allStoryTags, error: tagsError } = await supabase
      .from("story_tags")
      .select("story_id, tags(*)")
      .in("story_id", storyIds)

    if (tagsError) {
      console.error("Error al obtener etiquetas para historias por etiqueta:", tagsError)
    }

    // Agrupar etiquetas por historia
    const tagsByStory: Record<string, Tag[]> = {}
    allStoryTags?.forEach((item) => {
      if (!tagsByStory[item.story_id]) {
        tagsByStory[item.story_id] = []
      }
      tagsByStory[item.story_id].push(item.tags)
    })

    // Añadir etiquetas a cada historia
    const storiesWithTags = stories.map((story) => ({
      ...story,
      tags: tagsByStory[story.id] || [],
    }))

    return storiesWithTags as Story[]
  } catch (error) {
    console.error("Error inesperado al obtener historias por etiqueta:", error)
    return []
  }
}

// Función para verificar si un usuario existe por nombre de usuario
export async function getUserByUsername(username: string) {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Usar maybeSingle en lugar de single para evitar errores 406
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, display_name, admin")
      .eq("username", username)
      .maybeSingle()

    if (error) {
      console.error("Error al obtener usuario por nombre de usuario:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error inesperado al obtener usuario por nombre de usuario:", error)
    return null
  }
}

// Función para obtener el perfil del usuario actual
export async function getCurrentUserProfile() {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Obtener la sesión actual
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.error("Error al obtener la sesión o usuario no autenticado:", sessionError)
      return null
    }

    // Usar maybeSingle en lugar de single para evitar errores 406
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle()

    if (profileError) {
      console.error("Error al obtener el perfil del usuario:", profileError)
      return null
    }

    return profile
  } catch (error) {
    console.error("Error inesperado al obtener el perfil del usuario:", error)
    return null
  }
}

// Función para obtener el conteo de comentarios para múltiples historias
export async function getCommentCountsForStories(storyIds: string[]) {
  if (!storyIds || storyIds.length === 0) return {}

  const supabase = createServerComponentClient({ cookies })

  try {
    // Usar la función SQL que creamos para obtener los conteos de comentarios
    const { data, error } = await supabase.rpc("get_comment_counts", { story_ids: storyIds })

    if (error) {
      console.error("Error al obtener conteo de comentarios:", error)
      return {}
    }

    // Convertir el resultado a un objeto para fácil acceso
    const commentCounts: Record<string, number> = {}
    data?.forEach((item) => {
      commentCounts[item.story_id] = Number(item.comment_count)
    })

    return commentCounts
  } catch (error) {
    console.error("Error inesperado al obtener conteo de comentarios:", error)
    return {}
  }
}
