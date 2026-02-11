import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://cronicaslaborales.com"

  return {
    rules: [
      {
        // Reglas para todos los bots
        userAgent: "*",
        allow: [
          "/",
          "/story/*",
          "/tag/*",
          "/buscar",
          "/mi-libro",
          "/sobre-nosotros",
          "/politica-de-privacidad",
          "/politica-de-cookies",
          "/terminos-de-servicio",
        ],
        // Bloquear rutas administrativas y privadas
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/auth/*",
          "/dashboard/*",
          "/profile/*",
          "/submit",
          "/nueva-historia",
        ],
      },
      {
        // Reglas específicas para Googlebot (opcional)
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/api/*",
          "/auth/*",
          "/dashboard/*",
          "/profile/*",
          "/submit",
          "/nueva-historia",
        ],
      },
    ],
    // Referencia al sitemap
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
