import { createRouteHandlerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import { verifyAdminAccess } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    // Verificar autenticación y permisos de administrador usando el cliente normal
    const supabase = createRouteHandlerClient()

    // Usar nuestra nueva función para verificar acceso de administrador
    const accessCheck = await verifyAdminAccess(supabase)

    if (!accessCheck.authorized) {
      return NextResponse.json(
        { success: false, error: accessCheck.error },
        { status: accessCheck.error === "No autenticado" ? 401 : 403 },
      )
    }

    // Obtener el ID de la historia del cuerpo de la solicitud
    const { storyId } = await request.json()

    if (!storyId) {
      return NextResponse.json({ success: false, error: "ID de historia no proporcionado" }, { status: 400 })
    }

    // Crear un cliente con la clave de servicio usando nuestra función segura
    const supabaseAdmin = createAdminClient()

    // Eliminar la historia
    const { error } = await supabaseAdmin.from("stories").delete().eq("id", storyId)

    if (error) {
      console.error("Error al eliminar la historia:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Historia eliminada correctamente",
    })
  } catch (error) {
    console.error("Error en el endpoint de eliminación de historia:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
