import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Story, Comment, Tag } from "./types"

export async function getStories() {
  const supabase = createServerComponentClient({ cookies })

  // Obtener solo historias publicadas
  const { data: stories, error } = await supabase
    .from("stories")
    .select("*, story_tags(tag_id)")
    .eq("published", true)
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
}

export async function getStoryById(id: string) {
  const supabase = createServerComponentClient({ cookies })

  const { data: story } = await supabase.from("stories").select("*").eq("id", id).single()

  if (!story) return null

  // Obtener etiquetas para la historia
  const { data: storyTags } = await supabase.from("story_tags").select("tags(*)").eq("story_id", id)

  const tags = storyTags?.map((item) => item.tags) || []

  return { ...story, tags } as Story
}

export async function getAdminStories() {
  const supabase = createServerComponentClient({ cookies })

  const { data: stories } = await supabase
    .from("stories")
    .select("*")
    .eq("published", false)
    .order("created_at", { ascending: false })

  return (stories as Story[]) || []
}

export async function getCommentsByStoryId(storyId: string) {
  const supabase = createServerComponentClient({ cookies })

  const { data } = await supabase
    .from("comments")
    .select("*")
    .eq("story_id", storyId)
    .order("created_at", { ascending: true })

  return (data as Comment[]) || []
}

export async function getAllTags() {
  const supabase = createServerComponentClient({ cookies })

  // Obtener todas las etiquetas
  const { data: tags } = await supabase.from("tags").select("*").order("name", { ascending: true })

  if (!tags) return []

  // Realizar consultas separadas para obtener el recuento de cada etiqueta
  // En lugar de intentar hacer un GROUP BY que no funciona bien con la API de Supabase
  const tagCounts: Record<string, number> = {}

  // Obtener el recuento de cada etiqueta manualmente
  for (const tag of tags) {
    const { count, error } = await supabase
      .from("story_tags")
      .select("*", { count: "exact", head: true })
      .eq("tag_id", tag.id)

    if (error) {
      console.error(`Error al obtener recuento para etiqueta ${tag.id}:`, error)
      tagCounts[tag.id] = 0
    } else {
      tagCounts[tag.id] = count || 0
    }
  }

  // Añadir el recuento a cada etiqueta
  const tagsWithCount = tags.map((tag) => ({
    ...tag,
    count: tagCounts[tag.id] || 0,
  }))

  // Ordenar por recuento (más populares primero)
  return tagsWithCount.sort((a, b) => (b.count || 0) - (a.count || 0)) as Tag[]
}

export async function getStoriesByTag(tagId: string) {
  const supabase = createServerComponentClient({ cookies })

  const { data: storyTags } = await supabase.from("story_tags").select("story_id").eq("tag_id", tagId)

  if (!storyTags || storyTags.length === 0) return []

  const storyIds = storyTags.map((item) => item.story_id)

  const { data: stories } = await supabase
    .from("stories")
    .select("*")
    .in("id", storyIds)
    .eq("published", true)
    .order("created_at", { ascending: false })

  if (!stories) return []

  // Obtener todas las etiquetas para las historias
  const { data: allStoryTags } = await supabase.from("story_tags").select("story_id, tags(*)").in("story_id", storyIds)

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
}
