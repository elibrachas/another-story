import { createRouteHandlerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import { verifyAdminAccess } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    // Verificar autenticación y permisos de administrador
    const supabase = createRouteHandlerClient()
    const accessCheck = await verifyAdminAccess(supabase)

    if (!accessCheck.authorized) {
      return NextResponse.json(
        { success: false, error: accessCheck.error },
        { status: accessCheck.error === "No autenticado" ? 401 : 403 },
      )
    }

    // Obtener el ID del comentario del cuerpo de la solicitud
    const { commentId } = await request.json()

    if (!commentId) {
      return NextResponse.json({ success: false, error: "ID de comentario no proporcionado" }, { status: 400 })
    }

    // Crear un cliente con la clave de servicio usando nuestra función segura
    const supabaseAdmin = createAdminClient()

    // Eliminar el comentario
    const { error } = await supabaseAdmin.from("comments").delete().eq("id", commentId)

    if (error) {
      console.error("Error al eliminar el comentario:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Comentario eliminado correctamente",
    })
  } catch (error) {
    console.error("Error en el endpoint de eliminación de comentario:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
