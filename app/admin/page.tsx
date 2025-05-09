import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AdminStoryList } from "@/components/admin/admin-story-list"
import { AdminCommentList } from "@/components/admin/admin-comment-list"
import { AdminUserList } from "@/components/admin/admin-user-list"
import { AdminStats } from "@/components/admin/admin-stats"
import { getAdminStories, getAdminComments, getAdminUsers, getAdminStats } from "@/lib/supabase-admin"

export default async function AdminPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  // En una aplicación real, verificaríamos si el usuario es administrador
  // Por ahora, asumimos que el usuario conectado es administrador
  const [stories, comments, users, stats] = await Promise.all([
    getAdminStories(),
    getAdminComments(),
    getAdminUsers(),
    getAdminStats(),
  ])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
        <Link href="/">
          <Button variant="outline">Volver al Sitio</Button>
        </Link>
      </div>

      <AdminStats stats={stats} />

      <Tabs defaultValue="stories" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="stories">Historias</TabsTrigger>
          <TabsTrigger value="comments">Comentarios</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
        </TabsList>

        <TabsContent value="stories">
          <Card>
            <CardHeader>
              <CardTitle>Gestionar Historias</CardTitle>
              <CardDescription>Revisar y publicar historias enviadas</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminStoryList stories={stories} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Gestionar Comentarios</CardTitle>
              <CardDescription>Moderar comentarios de los usuarios</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminCommentList comments={comments} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gestionar Usuarios</CardTitle>
              <CardDescription>Administrar cuentas de usuario</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminUserList users={users} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
