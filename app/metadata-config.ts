import type { Metadata } from "next"

// URL base para metadatos
const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "https://cronicaslaborales.com" // Cambia esto a tu dominio predeterminado

// Configuración de metadatos por defecto
export const defaultMetadata: Metadata = {
  title: {
    default: "Crónicas Laborales",
    template: "%s | Crónicas Laborales",
  },
  description: "Experiencias reales sobre ambientes laborales tóxicos. Lee, aprende y sabe que no estás solo.",
  keywords: ["trabajo tóxico", "experiencias laborales", "historias laborales", "ambiente laboral", "testimonios"],
  authors: [{ name: "Eliana Bracciaforte" }],
  creator: "Eliana Bracciaforte",
  publisher: "Crónicas Laborales",
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: baseUrl,
    title: "Crónicas Laborales",
    description: "Experiencias reales sobre ambientes laborales tóxicos",
    siteName: "Crónicas Laborales",
    images: [
      {
        url: `${baseUrl}/images/og-image.jpg`, // Puedes crear esta imagen más adelante
        width: 1200,
        height: 630,
        alt: "Crónicas Laborales",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Crónicas Laborales",
    description: "Experiencias reales sobre ambientes laborales tóxicos",
    images: [`${baseUrl}/images/og-image.jpg`], // Misma imagen que para OpenGraph
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
}

// Función para generar metadatos para una historia específica
export function generateStoryMetadata(story: {
  title: string
  content: string
  author: string
  industry: string
  id: string
}): Metadata {
  const title = `${story.title} | Crónicas Laborales`
  const description = story.content.substring(0, 160) + "..."

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `${baseUrl}/story/${story.id}`,
    },
    twitter: {
      title,
      description,
      card: "summary_large_image",
    },
    alternates: {
      canonical: `/story/${story.id}`,
    },
  }
}

// Función para generar metadatos para una página de etiqueta
export function generateTagMetadata(tag: { name: string; id: string }): Metadata {
  const title = `Historias sobre ${tag.name} | Crónicas Laborales`
  const description = `Lee experiencias reales sobre ambientes laborales en ${tag.name}. Historias anónimas compartidas por la comunidad.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/tag/${tag.id}`,
    },
    twitter: {
      title,
      description,
    },
    alternates: {
      canonical: `/tag/${tag.id}`,
    },
  }
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export const themeColor = [
  { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  { media: "(prefers-color-scheme: dark)", color: "#000000" },
]
