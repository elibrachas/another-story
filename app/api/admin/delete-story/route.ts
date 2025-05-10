import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    // Verificar autenticación y permisos de administrador usando el cliente normal
    const supabase = createRouteHandlerClient({ cookies })

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("admin")
      .eq("id", userData.user.id)
      .single()

    if (profileError || !profileData?.admin) {
      return NextResponse.json({ success: false, error: "No tienes permisos de administrador" }, { status: 403 })
    }

    // Obtener el ID de la historia del cuerpo de la solicitud
    const { storyId } = await request.json()

    if (!storyId) {
      return NextResponse.json({ success: false, error: "ID de historia no proporcionado" }, { status: 400 })
    }

    // Crear un cliente con la clave de servicio para eludir las políticas RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    )

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
