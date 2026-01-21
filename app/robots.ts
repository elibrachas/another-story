import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  // Determinar la URL base según el entorno
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "https://cronicaslaborales.com" // Cambia esto a tu dominio predeterminado

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
