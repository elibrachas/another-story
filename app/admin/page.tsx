import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PendingStories } from "@/components/admin/pending-stories"
import { AdminCommentsList } from "@/components/admin/comments-list"
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

  // Obtener comentarios recientes para moderar
  const { data: recentComments } = await supabase
    .from("comments")
    .select(`
      *,
      stories!inner(id, title)
    `)
    .order("created_at", { ascending: false })
    .limit(20)

  // Formatear los comentarios para incluir el título de la historia
  const formattedComments =
    recentComments?.map((comment) => ({
      ...comment,
      story_title: comment.stories.title,
      story_id: comment.stories.id,
    })) || []

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>

      <Tabs defaultValue="stories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stories">Historias Pendientes</TabsTrigger>
          <TabsTrigger value="comments">Comentarios</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="stories">
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

        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Moderación de Comentarios</CardTitle>
              <CardDescription>Revisa y modera los comentarios de los usuarios</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminCommentsList comments={formattedComments} />
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
