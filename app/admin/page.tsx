import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminStoryList } from "@/components/admin-story-list"

// Lista de correos electrónicos autorizados como administradores
const ADMIN_EMAILS = ["bracciaforte@gmail.com", "metu26@gmail.com"]

export default async function AdminPage() {
  const supabase = createServerComponentClient({ cookies })

  // Verificar autenticación
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    redirect("/auth")
  }

  // Verificar si el usuario es administrador
  const isAdmin = ADMIN_EMAILS.includes(userData.user.email?.toLowerCase() || "")
  if (!isAdmin) {
    redirect("/")
  }

  // Obtener historias pendientes de aprobación
  const { data: stories } = await supabase
    .from("stories")
    .select("*")
    .eq("published", false)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>

      <Card>
        <CardHeader>
          <CardTitle>Historias Pendientes</CardTitle>
          <CardDescription>Aprobar o rechazar historias enviadas por los usuarios</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminStoryList stories={stories || []} />
        </CardContent>
      </Card>
    </div>
  )
}
