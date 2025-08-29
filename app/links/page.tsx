import type { Metadata } from "next"
import LinkTree from "@/components/link-tree"

export const metadata: Metadata = {
  title: "Eli Brachas - Enlaces | Crónicas Laborales",
  description: "Todos los enlaces importantes de Eli Brachas - Desarrollador Full Stack",
  openGraph: {
    title: "Eli Brachas - Enlaces",
    description: "Desarrollador Full Stack - Todos mis enlaces en un solo lugar",
    url: "https://cronicaslaborales.com/links",
    siteName: "Crónicas Laborales",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eli Brachas - Enlaces",
    description: "Desarrollador Full Stack - Todos mis enlaces en un solo lugar",
  },
}

export default function LinksPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-4 pt-8 bg-secondary">
      <LinkTree />
    </main>
  )
}
