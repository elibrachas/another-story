import { redirect } from "next/navigation"
import { createServerComponentClient } from "@/lib/supabase-server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EditStoryForm } from "@/components/admin/edit-story-form"

export default async function EditStoryPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient()

  // Verificar autenticación
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    redirect("/auth")
  }

  // Verificar si el usuario es administrador
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("admin")
    .eq("id", userData.user.id)
    .single()

  if (profileError || !profileData || !profileData.admin) {
    redirect("/")
  }

  // Obtener la historia a editar
  const { data: story, error: storyError } = await supabase.from("stories").select("*").eq("id", params.id).single()

  if (storyError || !story) {
    redirect("/admin")
  }

  // Obtener etiquetas para la historia
  const { data: storyTags, error: tagsError } = await supabase
    .from("story_tags")
    .select("tags(*)")
    .eq("story_id", params.id)

  const tags = storyTags?.map((item) => item.tags) || []

  // Obtener todas las etiquetas disponibles
  const { data: allTags } = await supabase.from("tags").select("*").order("name", { ascending: true })

  return (
    <div className="max-w-4xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Editar Historia</CardTitle>
          <CardDescription>
            Edita el contenido de la historia antes de publicarla. Puedes mejorar el texto, corregir errores o eliminar
            información sensible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditStoryForm story={{ ...story, tags }} allTags={allTags || []} />
        </CardContent>
      </Card>
    </div>
  )
}
