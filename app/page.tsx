import type { Metadata } from "next"
import LinkTree from "@/components/link-tree"

export const metadata: Metadata = {
  title: "Eli Brachas - Links",
  description: "Desarrollador Full Stack - Todos mis enlaces importantes en un solo lugar",
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-4 pt-8 bg-secondary">
      <LinkTree />
    </main>
  )
}
