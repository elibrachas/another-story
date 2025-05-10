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

    // Obtener los datos del cuerpo de la solicitud
    const { commentId, action } = await request.json()

    if (!commentId || !action) {
      return NextResponse.json({ success: false, error: "Datos incompletos" }, { status: 400 })
    }

    // Validar la acción
    if (action !== "approve" && action !== "disapprove") {
      return NextResponse.json({ success: false, error: "Acción no válida" }, { status: 400 })
    }

    // Crear un cliente con la clave de servicio para eludir las políticas RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    )

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
