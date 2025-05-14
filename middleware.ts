import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Obtener la sesión actual
  const {
    data: { session },
  } = await supabase.auth.getSession()

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
      const { data: profile } = await supabase.from("profiles").select("country").eq("id", session.user.id).single()

      // Solo actualizar si el perfil existe y no tiene país o tiene 'XX'
      if (profile && (profile.country === "XX" || !profile.country)) {
        await supabase.from("profiles").update({ country }).eq("id", session.user.id)
      }
    } catch (error) {
      console.error("Error al actualizar el país en el perfil:", error)
    }
  }

  return res
}
