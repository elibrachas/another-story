import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Verificar variables de entorno (sin mostrar valores completos por seguridad)
    const envCheck = {
      SUPABASE_URL: process.env.SUPABASE_URL ? "✓ Configurado" : "✗ No configurado",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? "✓ Configurado" : "✗ No configurado",
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Configurado" : "✗ No configurado",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Configurado" : "✗ No configurado",
    }

    // Intentar crear un cliente de Supabase
    const supabase = createRouteHandlerClient({ cookies })

    // Intentar una consulta simple
    const { data, error } = await supabase.from("stories").select("count").limit(1)

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "Error de conexión a Supabase",
          envCheck,
          error: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "success",
      message: "Conexión a Supabase establecida correctamente",
      envCheck,
      data,
    })
  } catch (error) {
    console.error("Error al verificar configuración:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Error inesperado al verificar configuración",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
