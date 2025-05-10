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

    // Obtener el ID de la historia del cuerpo de la solicitud
    const { storyId } = await request.json()
    if (!storyId) {
      return NextResponse.json({ message: "ID de historia no proporcionado" }, { status: 400 })
    }

    console.log(`Aprobando historia con ID: ${storyId}`)

    // Actualizar la historia a publicada
    const { data, error } = await supabase
      .from("stories")
      .update({ published: true })
      .eq("id", storyId)
      .select()
      .single()

    if (error) {
      console.error("Error al aprobar historia:", error)
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    // Revalidar rutas
    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath(`/story/${storyId}`)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error en la ruta de aprobar historia:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
