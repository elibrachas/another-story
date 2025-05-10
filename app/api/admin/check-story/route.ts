import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  try {
    // Verificar autenticación y permisos de administrador
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

    // Obtener el ID de la historia de los parámetros de consulta
    const url = new URL(request.url)
    const storyId = url.searchParams.get("id")

    if (!storyId) {
      return NextResponse.json({ success: false, error: "ID de historia no proporcionado" }, { status: 400 })
    }

    // Crear un cliente con la clave de servicio para eludir las políticas RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    )

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
