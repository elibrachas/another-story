import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createInitialProfile } from "@/lib/actions"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  // Si hay un error en la URL, redirigir a la página de error
  if (error) {
    console.error(`Error en callback de autenticación: ${error} - ${errorDescription}`)
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=${error}&error_description=${errorDescription}`)
  }

  if (!code) {
    console.error("No se encontró código en la URL de callback")
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=no_code`)
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Intercambiar el código por una sesión
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error("Error al intercambiar código por sesión:", sessionError)

      // Redirigir a una página de error con información específica
      return NextResponse.redirect(
        `${requestUrl.origin}/auth?error=session_exchange&message=${encodeURIComponent(sessionError.message)}`,
      )
    }

    // Verificar si el usuario ya tiene un perfil para evitar creaciones duplicadas
    if (data?.session?.user) {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.session.user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error al verificar perfil existente:", profileError)
        }

        // Solo crear perfil si no existe
        if (!profileData) {
          console.log("Creando perfil inicial desde callback...")
          const result = await createInitialProfile()
          console.log("Resultado de createInitialProfile:", result)
        } else {
          console.log("Perfil ya existe, no es necesario crearlo")
        }
      } catch (profileError) {
        console.error("Error al verificar o crear perfil:", profileError)
        // Continuar con la redirección aunque haya error en la creación del perfil
      }
    }

    // Redirigir al homepage después de la autenticación exitosa
    return NextResponse.redirect(`${requestUrl.origin}/`)
  } catch (error) {
    console.error("Error inesperado en callback:", error)
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=unexpected`)
  }
}
