import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { isAuthorizedAdmin } from "@/lib/admin-utils"
import { revalidatePath } from "next/cache"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Verificar autenticación
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 })
    }

    // Verificar si es administrador
    if (!isAuthorizedAdmin(session.user.email)) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 })
    }

    // Obtener el ID del comentario del cuerpo de la solicitud
    const { commentId } = await request.json()
    if (!commentId) {
      return NextResponse.json({ message: "ID de comentario no proporcionado" }, { status: 400 })
    }

    console.log(`Aprobando comentario con ID: ${commentId}`)

    // Obtener información del comentario para revalidar la ruta correcta
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .select("story_id")
      .eq("id", commentId)
      .single()

    if (commentError) {
      console.error("Error al obtener información del comentario:", commentError)
      return NextResponse.json({ message: commentError.message }, { status: 500 })
    }

    // Actualizar el comentario a aprobado
    const { data, error } = await supabase.from("comments").update({ approved: true }).eq("id", commentId).select()

    if (error) {
      console.error("Error al aprobar comentario:", error)
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    // Revalidar rutas
    revalidatePath("/admin")
    if (comment?.story_id) {
      revalidatePath(`/story/${comment.story_id}`)
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error en la ruta de aprobar comentario:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
