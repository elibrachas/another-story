import { createClient } from "@supabase/supabase-js"

function getSupabaseUrl(): string {
  // Usar la variable de entorno estándar
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
  }
  if (process.env.SUPABASE_URL) {
    return process.env.SUPABASE_URL
  }

  // Fallback - esto causará un error pero es mejor que fallar silenciosamente
  console.error("No se pudo determinar la URL de Supabase desde las variables de entorno")
  return "https://placeholder.supabase.co"
}

function createServerClient() {
  const supabaseUrl = getSupabaseUrl()
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseKey) {
    console.error("No se encontró clave de Supabase")
    throw new Error("Supabase key not found")
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export async function getStories(page = 1, limit = 10, searchTerm?: string, tag?: string) {
  try {
    const supabase = createServerClient()

    let query = supabase
      .from("stories")
      .select(`
        *,
        tags:story_tags(tag:tags(id, name))
      `)
      .eq("published", true)
      .order("created_at", { ascending: false })

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%, content.ilike.%${searchTerm}%`)
    }

    if (tag) {
      query = query.contains("tags", [{ tag: { name: tag } }])
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query.range(from, to)

    if (error) {
      console.error("Error fetching stories:", error)
      return { stories: [], totalCount: 0, error: error.message }
    }

    return {
      stories: data || [],
      totalCount: count || 0,
      error: null,
    }
  } catch (error) {
    console.error("Error in getStories:", error)
    return {
      stories: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getStoryById(id: string) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("stories")
      .select(`
        *,
        tags:story_tags(tag:tags(id, name)),
        comments:comments(
          id,
          content,
          created_at,
          author,
          approved,
          upvotes
        )
      `)
      .eq("id", id)
      .eq("published", true)
      .single()

    if (error) {
      console.error("Error fetching story:", error)
      return { story: null, error: error.message }
    }

    return { story: data, error: null }
  } catch (error) {
    console.error("Error in getStoryById:", error)
    return {
      story: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getTags() {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("tags").select("*").order("name")

    if (error) {
      console.error("Error fetching tags:", error)
      return { tags: [], error: error.message }
    }

    return { tags: data || [], error: null }
  } catch (error) {
    console.error("Error in getTags:", error)
    return {
      tags: [],
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Alias for getTags for backward compatibility
export const getAllTags = getTags

export async function getCommentCountsForStories(storyIds: string[]) {
  try {
    const supabase = createServerClient()

    if (!storyIds || storyIds.length === 0) {
      return {}
    }

    const { data, error } = await supabase
      .from("comments")
      .select("story_id")
      .in("story_id", storyIds)
      .eq("approved", true)

    if (error) {
      console.error("Error fetching comment counts:", error)
      return {}
    }

    // Count comments per story
    const counts: Record<string, number> = {}
    for (const comment of data || []) {
      counts[comment.story_id] = (counts[comment.story_id] || 0) + 1
    }

    return counts
  } catch (error) {
    console.error("Error in getCommentCountsForStories:", error)
    return {}
  }
}

export async function getStoriesByTag(tagName: string, page = 1, limit = 10) {
  try {
    const supabase = createServerClient()

    const { data, error, count } = await supabase
      .from("stories")
      .select(`
        *,
        tags:story_tags(tag:tags(id, name))
      `)
      .eq("published", true)
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) {
      console.error("Error fetching stories by tag:", error)
      return { stories: [], totalCount: 0, error: error.message }
    }

    return {
      stories: data || [],
      totalCount: count || 0,
      error: null,
    }
  } catch (error) {
    console.error("Error in getStoriesByTag:", error)
    return {
      stories: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
