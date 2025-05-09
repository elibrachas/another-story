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
import { DebugPanel } from "@/components/admin/debug-panel"
import { getAdminStories, getAdminComments, getAdminUsers, getAdminStats } from "@/lib/supabase-admin"
import { isAuthorizedAdmin } from "@/lib/admin-utils"

export default async function AdminPage() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  // Verificar si el usuario actual está autorizado como administrador
  const userEmail = session.user.email
  if (!isAuthorizedAdmin(userEmail)) {
    // Si no está autorizado, redirigir a la página principal
    redirect("/")
  }

  // El usuario está autorizado, cargar los datos de administración
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
        <div className="flex gap-2">
          <Link href="/admin/emergency">
            <Button variant="destructive" size="sm">
              Herramientas de Emergencia
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Volver al Sitio</Button>
          </Link>
        </div>
      </div>

      <AdminStats stats={stats} />

      <Tabs defaultValue="stories" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="stories">Historias</TabsTrigger>
          <TabsTrigger value="comments">Comentarios</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="debug">Depuración</TabsTrigger>
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

        <TabsContent value="debug">
          <DebugPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
