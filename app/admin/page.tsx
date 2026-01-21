import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PendingStories } from "@/components/admin/pending-stories"
import { AllStories } from "@/components/admin/all-stories"
import { CommentModeration } from "@/components/admin/comment-moderation"
import { StatsDashboard } from "@/components/admin/stats-dashboard"

export default async function AdminPage() {
  const supabase = createServerComponentClient({ cookies })

  // Verificar autenticación
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    redirect("/auth")
  }

  // Verificar si el usuario es administrador consultando la tabla profiles
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("admin")
    .eq("id", userData.user.id)
    .single()

  if (profileError || !profileData || !profileData.admin) {
    redirect("/")
  }

  // Obtener historias pendientes de aprobación
  const { data: pendingStories } = await supabase
    .from("stories")
    .select("*")
    .eq("published", false)
    .order("created_at", { ascending: false })

  // Obtener todas las historias
  const { data: allStories } = await supabase.from("stories").select("*").order("created_at", { ascending: false })

  // Obtener comentarios para moderar
  const { data: allComments } = await supabase
    .from("comments")
    .select(`
      *,
      stories!inner(id, title)
    `)
    .order("created_at", { ascending: false })

  // Formatear los comentarios para incluir el título de la historia
  const formattedComments =
    allComments?.map((comment) => ({
      ...comment,
      story_title: comment.stories.title,
      story_id: comment.stories.id,
      approved: comment.approved !== false, // Si no existe el campo, asumimos que está aprobado
    })) || []

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Historias Pendientes</TabsTrigger>
          <TabsTrigger value="all-stories">Todas las Historias</TabsTrigger>
          <TabsTrigger value="comments">Comentarios</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Historias Pendientes de Aprobación</CardTitle>
              <CardDescription>
                Revisa y modera las historias enviadas por los usuarios antes de publicarlas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PendingStories stories={pendingStories || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all-stories">
          <Card>
            <CardHeader>
              <CardTitle>Todas las Historias</CardTitle>
              <CardDescription>Gestiona todas las historias de la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <AllStories stories={allStories || []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Moderación de Comentarios</CardTitle>
              <CardDescription>Revisa y modera los comentarios de los usuarios</CardDescription>
            </CardHeader>
            <CardContent>
              <CommentModeration comments={formattedComments} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de la Plataforma</CardTitle>
              <CardDescription>Visualiza métricas y estadísticas de la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <StatsDashboard />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
