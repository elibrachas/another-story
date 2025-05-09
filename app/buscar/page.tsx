import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { StoryCard } from "@/components/story-card"
import { SearchBar } from "@/components/search-bar"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q: string }
}) {
  const query = searchParams.q || ""
  const supabase = createServerComponentClient({ cookies })

  const { data: stories, error } = await supabase
    .from("stories")
    .select(`
      *,
      profiles(username),
      story_tags(
        tags(id, name)
      )
    `)
    .or(`title.ilike.%${query}%, content.ilike.%${query}%`)
    .eq("published", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching stories:", error)
  }

  // Formatear los resultados para que coincidan con la estructura esperada por StoryCard
  const formattedStories =
    stories?.map((story) => {
      const tags = story.story_tags?.map((st) => st.tags) || []
      return {
        ...story,
        tags,
      }
    }) || []

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold mb-6">Resultados de búsqueda: {query}</h1>

      <div className="mb-8">
        <SearchBar />
      </div>

      {formattedStories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formattedStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">No se encontraron resultados</h2>
          <p className="text-muted-foreground">
            No hay historias que coincidan con "{query}". Intenta con otros términos.
          </p>
        </div>
      )}
    </div>
  )
}
