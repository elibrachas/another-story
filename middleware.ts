import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Intentar refrescar la sesión en cada solicitud
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    // Si hay un error con la sesión, intentar refrescarla
    if (error) {
      console.error("Error en middleware al obtener sesión:", error)

      // Intentar refrescar la sesión
      const refreshResult = await supabase.auth.refreshSession()

      if (refreshResult.error) {
        console.error("Error al refrescar la sesión en middleware:", refreshResult.error)
      }
    }

    // Capturar el país del usuario desde los headers de Vercel
    const country = req.geo?.country || req.headers.get("x-vercel-ip-country") || "XX"

    // Establecer el país en una cookie para usarlo en el cliente
    res.cookies.set("user-country", country, {
      httpOnly: false, // Permitir acceso desde JavaScript
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: "/",
      sameSite: "lax",
    })

    // Si el usuario está autenticado, actualizar su perfil con el país
    if (session) {
      try {
        // Verificar si el perfil ya tiene un país asignado
        // Usar maybeSingle en lugar de single para evitar errores 406
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("country")
          .eq("id", session.user.id)
          .maybeSingle()

        if (profileError) {
          console.error("Error al obtener el perfil en middleware:", profileError)
        } else {
          // Solo actualizar si el perfil existe y no tiene país o tiene 'XX'
          if (profile && (profile.country === "XX" || !profile.country)) {
            const { error: updateError } = await supabase.from("profiles").update({ country }).eq("id", session.user.id)

            if (updateError) {
              console.error("Error al actualizar el país en el perfil:", updateError)
            }
          }
        }
      } catch (error) {
        console.error("Error inesperado al actualizar el país en el perfil:", error)
      }
    }
  } catch (error) {
    console.error("Error inesperado en middleware:", error)
  }

  return res
}
