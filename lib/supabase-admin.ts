import { createClient } from "@supabase/supabase-js"

function getSupabaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
  }
  if (process.env.SUPABASE_URL) {
    return process.env.SUPABASE_URL
  }
  console.error("No se pudo determinar la URL de Supabase")
  return "https://placeholder.supabase.co"
}

export function createAdminClient() {
  const supabaseUrl = getSupabaseUrl()
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseServiceKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY no encontrada")
    throw new Error("Supabase service role key not found")
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export const supabaseAdmin = createAdminClient()

// Funciones de administración
export async function getAllStories() {
  try {
    const { data, error } = await supabaseAdmin
      .from("stories")
      .select(`
        *,
        tags:story_tags(tag:tags(id, name)),
        upvotes:story_upvotes(count),
        comments:comments(count)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching all stories:", error)
      return { stories: [], error: error.message }
    }

    return { stories: data || [], error: null }
  } catch (error) {
    console.error("Error in getAllStories:", error)
    return {
      stories: [],
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function getPendingStories() {
  try {
    const { data, error } = await supabaseAdmin
      .from("stories")
      .select(`
        *,
        tags:story_tags(tag:tags(id, name))
      `)
      .eq("published", false)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching pending stories:", error)
      return { stories: [], error: error.message }
    }

    return { stories: data || [], error: null }
  } catch (error) {
    console.error("Error in getPendingStories:", error)
    return {
      stories: [],
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function approveStory(storyId: string) {
  try {
    const { error } = await supabaseAdmin.from("stories").update({ published: true }).eq("id", storyId)

    if (error) {
      console.error("Error approving story:", error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Error in approveStory:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function deleteStory(storyId: string) {
  try {
    const { error } = await supabaseAdmin.from("stories").delete().eq("id", storyId)

    if (error) {
      console.error("Error deleting story:", error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Error in deleteStory:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
