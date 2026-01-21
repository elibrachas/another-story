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

    // Obtener los datos del cuerpo de la solicitud
    const { commentId, action } = await request.json()

    if (!commentId || !action) {
      return NextResponse.json({ success: false, error: "Datos incompletos" }, { status: 400 })
    }

    // Validar la acción
    if (action !== "approve" && action !== "disapprove") {
      return NextResponse.json({ success: false, error: "Acción no válida" }, { status: 400 })
    }

    // Crear un cliente con la clave de servicio usando nuestra función segura
    const supabaseAdmin = createAdminClient()

    // Actualizar el estado del comentario
    const { data, error } = await supabaseAdmin
      .from("comments")
      .update({ approved: action === "approve" })
      .eq("id", commentId)
      .select()

    if (error) {
      console.error("Error al actualizar estado del comentario:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: action === "approve" ? "Comentario aprobado" : "Comentario desaprobado",
      data,
    })
  } catch (error) {
    console.error("Error en el endpoint de estado de comentario:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
