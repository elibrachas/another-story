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
      console.error("Error de autenticación:", userError)
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("admin")
      .eq("id", userData.user.id)
      .single()

    if (profileError || !profileData?.admin) {
      console.error("Error de permisos:", profileError)
      return NextResponse.json({ success: false, error: "No tienes permisos de administrador" }, { status: 403 })
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

    // Crear un cliente con la clave de servicio para eludir las políticas RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    )

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
