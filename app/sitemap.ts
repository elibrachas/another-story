import type { MetadataRoute } from "next"
import { createClient } from "@supabase/supabase-js"

// Regenerate sitemap on every request so new stories appear immediately
export const dynamic = "force-dynamic"
export const revalidate = 0

const BASE_URL = "https://cronicaslaborales.com"
const STORIES_PER_PAGE = 12

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date()

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/mi-libro`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/buscar`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/sobre-nosotros`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/politica-de-privacidad`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/politica-de-cookies`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terminos-de-servicio`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    )

    // Fetch published stories
    const { data: stories, error: storiesError, count: storiesCount } = await supabase
      .from("stories")
      .select("id, created_at", { count: "exact" })
      .eq("published", true)
      .order("created_at", { ascending: false })

    if (storiesError) {
      console.error("Error fetching stories for sitemap:", storiesError)
      return staticRoutes
    }

    // Individual story routes
    const storyRoutes: MetadataRoute.Sitemap =
      stories?.map((story) => ({
        url: `${BASE_URL}/story/${story.id}`,
        lastModified: new Date(story.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })) || []

    // Paginated homepage routes (page 2+, page 1 is the root "/")
    const totalPages = Math.ceil((storiesCount || 0) / STORIES_PER_PAGE)
    const paginatedRoutes: MetadataRoute.Sitemap = []
    for (let page = 2; page <= totalPages; page++) {
      paginatedRoutes.push({
        url: `${BASE_URL}?page=${page}`,
        lastModified: currentDate,
        changeFrequency: "daily",
        priority: 0.5,
      })
    }

    // Fetch tags
    const { data: tags, error: tagsError } = await supabase
      .from("tags")
      .select("id, name")
      .order("name", { ascending: true })

    if (tagsError) {
      console.error("Error fetching tags for sitemap:", tagsError)
      return [...staticRoutes, ...storyRoutes, ...paginatedRoutes]
    }

    const tagRoutes: MetadataRoute.Sitemap =
      tags?.map((tag) => ({
        url: `${BASE_URL}/tag/${tag.id}`,
        lastModified: currentDate,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })) || []

    return [...staticRoutes, ...storyRoutes, ...paginatedRoutes, ...tagRoutes]
  } catch (error) {
    console.error("Error generating sitemap:", error)
    return staticRoutes
  }
}
