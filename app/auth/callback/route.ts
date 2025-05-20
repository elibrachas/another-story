import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createInitialProfile } from "@/lib/actions"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })

    try {
      // Intercambiar el código por una sesión
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Error al intercambiar código por sesión:", error)
        // Redirigir a una página de error
        return NextResponse.redirect(`${requestUrl.origin}/auth?error=session_exchange`)
      }

      // Verificar si el usuario ya tiene un perfil para evitar creaciones duplicadas
      if (data?.session?.user) {
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
          try {
            const result = await createInitialProfile()
            console.log("Resultado de createInitialProfile:", result)
          } catch (error) {
            console.error("Error al crear perfil inicial desde callback:", error)
          }
        } else {
          console.log("Perfil ya existe, no es necesario crearlo")
        }
      }
    } catch (error) {
      console.error("Error inesperado en callback:", error)
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=unexpected`)
    }
  } else {
    console.error("No se encontró código en la URL de callback")
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=no_code`)
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin)
}
