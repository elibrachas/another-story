import type { MetadataRoute } from "next"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Determinar la URL base según el entorno
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "https://cronicaslaborales.com" // Cambia esto a tu dominio predeterminado

  // Fecha actual para páginas estáticas
  const currentDate = new Date()

  // Páginas estáticas
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/sobre-nosotros`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/politica-de-privacidad`,
      lastModified: currentDate,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/politica-de-cookies`,
      lastModified: currentDate,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terminos-de-servicio`,
      lastModified: currentDate,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
  ]

  try {
    // Obtener historias publicadas para el sitemap
    const supabase = createServerComponentClient({ cookies })

    // Obtener historias publicadas
    const { data: stories, error: storiesError } = await supabase
      .from("stories")
      .select("id, created_at, updated_at")
      .eq("published", true)
      .order("created_at", { ascending: false })

    if (storiesError) {
      console.error("Error al obtener historias para el sitemap:", storiesError)
      return staticRoutes
    }

    // Mapear historias a rutas del sitemap
    const storyRoutes =
      stories?.map((story) => ({
        url: `${baseUrl}/story/${story.id}`,
        lastModified: new Date(story.updated_at || story.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })) || []

    // Obtener etiquetas para el sitemap
    const { data: tags, error: tagsError } = await supabase
      .from("tags")
      .select("id, name")
      .order("name", { ascending: true })

    if (tagsError) {
      console.error("Error al obtener etiquetas para el sitemap:", tagsError)
      return [...staticRoutes, ...storyRoutes]
    }

    // Mapear etiquetas a rutas del sitemap
    const tagRoutes =
      tags?.map((tag) => ({
        url: `${baseUrl}/tag/${tag.id}`,
        lastModified: currentDate,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })) || []

    // Combinar todas las rutas
    return [...staticRoutes, ...storyRoutes, ...tagRoutes]
  } catch (error) {
    console.error("Error al generar el sitemap:", error)
    // En caso de error, devolver al menos las rutas estáticas
    return staticRoutes
  }
}
