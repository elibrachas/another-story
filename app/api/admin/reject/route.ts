import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

// Lista de correos electrónicos autorizados como administradores
const ADMIN_EMAILS = ["bracciaforte@gmail.com", "metu26@gmail.com"]

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticación
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 })
    }

    // Verificar si el usuario es administrador
    const isAdmin = ADMIN_EMAILS.includes(userData.user.email?.toLowerCase() || "")
    if (!isAdmin) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 })
    }

    // Obtener el ID de la historia del cuerpo de la solicitud
    const { storyId } = await request.json()
    if (!storyId) {
      return NextResponse.json({ message: "ID de historia no proporcionado" }, { status: 400 })
    }

    console.log(`Rechazando historia con ID: ${storyId}`)

    // Eliminar la historia
    const { error } = await supabase.from("stories").delete().eq("id", storyId)

    if (error) {
      console.error("Error al rechazar historia:", error)
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    // Revalidar rutas
    revalidatePath("/admin")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error en la ruta de rechazar historia:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
