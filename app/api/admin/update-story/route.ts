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
    const { id, title, content, industry, publish } = await request.json()

    if (!id || !title || !content || !industry) {
      return NextResponse.json({ success: false, error: "Datos incompletos" }, { status: 400 })
    }

    console.log("API Route - Actualizando historia:", {
      id,
      title,
      contentPreview: content.substring(0, 50) + "...",
      contentLength: content.length,
      industry,
      publish,
    })

    // Crear un cliente con la clave de servicio para eludir las políticas RLS
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    )

    // Actualizar la historia
    const { data, error } = await supabaseAdmin
      .from("stories")
      .update({
        title,
        content,
        industry,
        published: publish,
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error al actualizar la historia:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Verificar que la actualización fue exitosa
    if (!data || data.length === 0) {
      console.error("No se encontró la historia o no se actualizó")
      return NextResponse.json(
        { success: false, error: "No se encontró la historia o no se actualizó" },
        { status: 404 },
      )
    }

    console.log("Historia actualizada exitosamente:", {
      id: data[0].id,
      title: data[0].title,
      contentPreview: data[0].content.substring(0, 50) + "...",
      contentLength: data[0].content.length,
    })

    return NextResponse.json({
      success: true,
      message: "Historia actualizada correctamente",
      data: data[0],
    })
  } catch (error) {
    console.error("Error en el endpoint de actualización de historia:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
