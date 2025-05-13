import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const url = new URL(request.url)
  const storyId = url.searchParams.get("storyId")

  if (!storyId) {
    return NextResponse.json({ error: "Se requiere storyId" }, { status: 400 })
  }

  try {
    // 1. Verificar si la historia existe
    const { data: story, error: storyError } = await supabase
      .from("stories")
      .select("id, title, upvotes")
      .eq("id", storyId)
      .single()

    if (storyError) {
      return NextResponse.json(
        {
          success: false,
          error: "Error al obtener la historia",
          details: storyError,
        },
        { status: 500 },
      )
    }

    if (!story) {
      return NextResponse.json({ success: false, error: "Historia no encontrada" }, { status: 404 })
    }

    // 2. Verificar la estructura de la tabla stories
    const { data: storiesInfo, error: infoError } = await supabase.rpc("get_table_info", { table_name: "stories" })

    if (infoError) {
      return NextResponse.json(
        {
          success: false,
          error: "Error al obtener información de la tabla",
          details: infoError,
        },
        { status: 500 },
      )
    }

    // 3. Intentar actualizar directamente el contador
    const currentUpvotes = story.upvotes || 0
    const newUpvotes = currentUpvotes + 1

    const { data: updateResult, error: updateError } = await supabase
      .from("stories")
      .update({ upvotes: newUpvotes })
      .eq("id", storyId)
      .select()

    // 4. Verificar el resultado después de la actualización
    const { data: afterUpdate, error: afterError } = await supabase
      .from("stories")
      .select("upvotes")
      .eq("id", storyId)
      .single()

    // 5. Intentar con la función SQL personalizada
    const { data: functionResult, error: functionError } = await supabase.rpc("increment_story_upvotes", {
      story_id_param: storyId,
    })

    // 6. Verificar nuevamente después de usar la función
    const { data: afterFunction, error: afterFunctionError } = await supabase
      .from("stories")
      .select("upvotes")
      .eq("id", storyId)
      .single()

    return NextResponse.json({
      success: true,
      story,
      tableInfo: storiesInfo,
      updateAttempt: {
        currentUpvotes,
        newUpvotes,
        result: updateResult,
        error: updateError,
        afterUpdate,
        afterUpdateError: afterError,
      },
      functionAttempt: {
        result: functionResult,
        error: functionError,
        afterFunction,
        afterFunctionError,
      },
    })
  } catch (error) {
    console.error("Error en diagnóstico de upvotes:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error general en diagnóstico",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
