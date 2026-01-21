import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import { verifyAdminAccess } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    // Verificar autenticación y permisos de administrador
    const supabase = createRouteHandlerClient({ cookies })
    const accessCheck = await verifyAdminAccess(supabase)

    if (!accessCheck.authorized) {
      return NextResponse.json(
        { success: false, error: accessCheck.error },
        { status: accessCheck.error === "No autenticado" ? 401 : 403 },
      )
    }

    // Obtener los datos del cuerpo de la solicitud
    const { storyId, action } = await request.json()

    if (!storyId || !action) {
      return NextResponse.json({ success: false, error: "Datos incompletos" }, { status: 400 })
    }

    // Validar la acción
    if (action !== "publish" && action !== "unpublish") {
      return NextResponse.json({ success: false, error: "Acción no válida" }, { status: 400 })
    }

    console.log(`Actualizando estado de historia ${storyId} a ${action}`)

    // Crear un cliente con la clave de servicio usando nuestra función segura
    const supabaseAdmin = createAdminClient()

    // Actualizar el estado de la historia
    const { data, error } = await supabaseAdmin
      .from("stories")
      .update({ published: action === "publish" })
      .eq("id", storyId)
      .select()

    if (error) {
      console.error("Error al actualizar estado de la historia:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: action === "publish" ? "Historia publicada" : "Historia despublicada",
      data,
    })
  } catch (error) {
    console.error("Error en el endpoint de estado de historia:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
