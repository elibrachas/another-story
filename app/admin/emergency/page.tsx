import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { EmergencyPublish } from "@/components/admin/emergency-publish"
import { isAuthorizedAdmin } from "@/lib/admin-utils"

export default async function EmergencyPage() {
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-red-500">Herramientas de Emergencia</h1>
        <Link href="/admin">
          <Button variant="outline">Volver al Panel de Administración</Button>
        </Link>
      </div>

      <div className="max-w-md mx-auto">
        <EmergencyPublish />
      </div>
    </div>
  )
}
