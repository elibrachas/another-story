import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Verificar autenticación
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Obtener información de las tablas relevantes
    const [upvotesResult, storiesResult] = await Promise.all([
      supabase
        .from("upvotes")
        .select("*")
        .limit(10), // Usar "upvotes" en lugar de "story_upvotes"
      supabase.from("stories").select("id, title, upvotes").limit(10),
    ])

    // Verificar si hay errores
    if (upvotesResult.error) {
      return NextResponse.json({ error: "Error al obtener upvotes", details: upvotesResult.error }, { status: 500 })
    }

    if (storiesResult.error) {
      return NextResponse.json({ error: "Error al obtener stories", details: storiesResult.error }, { status: 500 })
    }

    // Obtener los upvotes del usuario actual
    const userUpvotesResult = await supabase.from("upvotes").select("story_id").eq("user_id", session.user.id)

    // Devolver la información para depuración
    return NextResponse.json({
      success: true,
      upvotes: {
        count: upvotesResult.data?.length || 0,
        records: upvotesResult.data || [],
      },
      stories: {
        records: storiesResult.data || [],
      },
      userUpvotes: {
        count: userUpvotesResult.data?.length || 0,
        storyIds: userUpvotesResult.data?.map((record) => record.story_id) || [],
      },
    })
  } catch (error) {
    console.error("Error en la ruta de depuración de upvotes:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
