import { createRouteHandlerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import { verifyAdminAccess } from "@/lib/auth-utils"

export async function GET(request: Request) {
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

    // Obtener el ID de la historia de los parámetros de consulta
    const url = new URL(request.url)
    const storyId = url.searchParams.get("id")

    if (!storyId) {
      return NextResponse.json({ success: false, error: "ID de historia no proporcionado" }, { status: 400 })
    }

    // Crear un cliente con la clave de servicio usando nuestra función segura
    const supabaseAdmin = createAdminClient()

    // Obtener la historia
    const { data, error } = await supabaseAdmin.from("stories").select("*").eq("id", storyId).single()

    if (error) {
      console.error("Error al obtener la historia:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ success: false, error: "Historia no encontrada" }, { status: 404 })
    }

    // Devolver información básica y una vista previa del contenido
    return NextResponse.json({
      success: true,
      story: {
        id: data.id,
        title: data.title,
        industry: data.industry,
        published: data.published,
        contentPreview: data.content.substring(0, 100) + "...",
        contentLength: data.content.length,
        updatedAt: data.updated_at,
      },
    })
  } catch (error) {
    console.error("Error en el endpoint de verificación de historia:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
