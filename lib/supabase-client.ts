"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Story, Comment, Tag } from "./types"

// Singleton pattern para el cliente de Supabase
let supabaseClient: ReturnType<typeof createClientComponentClient> | null = null

// Cliente de Supabase para componentes del cliente
const createClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClientComponentClient()
  }
  return supabaseClient
}

// Implementación simple de caché en memoria
const cache: Record<string, { data: any; timestamp: number }> = {}
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos en milisegundos

// Función para obtener datos con caché
async function fetchWithCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  cacheDuration: number = CACHE_DURATION,
): Promise<T> {
  // Verificar si hay datos en caché y si son válidos
  const cachedData = cache[cacheKey]
  const now = Date.now()

  if (cachedData && now - cachedData.timestamp < cacheDuration) {
    console.log(`Usando datos en caché para ${cacheKey}`)
    return cachedData.data as T
  }

  try {
    // Si no hay caché o expiró, obtener datos frescos
    const data = await fetchFn()

    // Guardar en caché
    cache[cacheKey] = { data, timestamp: now }

    return data
  } catch (error) {
    // Si hay un error y tenemos datos en caché (incluso expirados), usarlos como fallback
    if (cachedData) {
      console.log(`Error al obtener datos frescos para ${cacheKey}, usando caché expirada`)
      return cachedData.data as T
    }

    // Si no hay caché, propagar el error
    throw error
  }
}

// Función para limpiar la caché
export function clearCache(cacheKey?: string) {
  if (cacheKey) {
    delete cache[cacheKey]
  } else {
    Object.keys(cache).forEach((key) => delete cache[key])
  }
}

export async function getStoriesClient() {
  return fetchWithCache<Story[]>("stories", async () => {
    const supabase = createClient()

    try {
      // Intentar hasta 3 veces con retraso exponencial
      let attempt = 0
      let lastError: any = null

      while (attempt < 3) {
        try {
          // Consulta simplificada para reducir la complejidad
          const { data: stories, error } = await supabase
            .from("stories")
            .select("*")
            .eq("published", true)
            .order("created_at", { ascending: false })

          if (error) {
            throw error
          }

          if (!stories || stories.length === 0) return []

          // Obtener IDs de historias para consultas posteriores
          const storyIds = stories.map((story) => story.id)

          // Obtener etiquetas en una consulta separada
          const { data: storyTags, error: tagsError } = await supabase
            .from("story_tags")
            .select("story_id, tags(*)")
            .in("story_id", storyIds)

          if (tagsError) {
            console.error("Error al obtener etiquetas:", tagsError)
            // Continuamos sin etiquetas si hay error
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
        } catch (err) {
          lastError = err
          attempt++

          if (attempt < 3) {
            // Esperar con retraso exponencial: 1s, 2s, 4s...
            await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000))
          }
        }
      }

      // Si llegamos aquí, todos los intentos fallaron
      throw lastError
    } catch (error) {
      console.error("Error inesperado al obtener historias:", error)
      throw error
    }
  })
}

// Actualizar las demás funciones para usar el sistema de caché
export async function getStoryByIdClient(id: string) {
  return fetchWithCache<Story | null>(`story-${id}`, async () => {
    const supabase = createClient()

    try {
      const { data: story, error } = await supabase.from("stories").select("*").eq("id", id).single()

      if (error) {
        console.error("Error al obtener historia:", error)
        return null
      }

      if (!story) return null

      // Obtener etiquetas para la historia
      const { data: storyTags, error: tagsError } = await supabase
        .from("story_tags")
        .select("tags(*)")
        .eq("story_id", id)

      if (tagsError) {
        console.error("Error al obtener etiquetas para historia:", tagsError)
      }

      const tags = storyTags?.map((item) => item.tags) || []

      return { ...story, tags } as Story
    } catch (error) {
      console.error("Error inesperado al obtener historia:", error)
      return null
    }
  })
}

export async function getCommentsByStoryIdClient(storyId: string) {
  return fetchWithCache<Comment[]>(`comments-${storyId}`, async () => {
    const supabase = createClient()

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
  })
}

export async function getAllTagsClient() {
  return fetchWithCache<Tag[]>("all-tags", async () => {
    const supabase = createClient()

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
        .select("tag_id, story_id, stories!inner(published)")
        .eq("stories.published", true)

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
  })
}

export async function getStoriesByTagClient(tagId: string) {
  return fetchWithCache<Story[]>(`stories-by-tag-${tagId}`, async () => {
    const supabase = createClient()

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
  })
}

// Implementar la función searchStoriesClient corregida
export async function searchStoriesClient(query: string) {
  return fetchWithCache<Story[]>(`search-${query}`, async () => {
    const supabase = createClient()

    try {
      if (!query.trim()) return []

      // Buscar historias que coincidan con el término de búsqueda
      // Solo usando las columnas que existen: title y content
      const { data: stories, error } = await supabase
        .from("stories")
        .select("*")
        .eq("published", true)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error al buscar historias:", error)
        return []
      }

      if (!stories || stories.length === 0) return []

      // Obtener IDs de historias para consultas posteriores
      const storyIds = stories.map((story) => story.id)

      // Obtener etiquetas en una consulta separada
      const { data: storyTags, error: tagsError } = await supabase
        .from("story_tags")
        .select("story_id, tags(*)")
        .in("story_id", storyIds)

      if (tagsError) {
        console.error("Error al obtener etiquetas para búsqueda:", tagsError)
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
      console.error("Error inesperado al buscar historias:", error)
      return []
    }
  })
}
