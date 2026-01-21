import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Función para obtener la URL de Supabase desde las variables disponibles
function getSupabaseUrl() {
  // Primero intentar la variable estándar
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
  }
  
  // Intentar SUPABASE_URL
  if (process.env.SUPABASE_URL) {
    return process.env.SUPABASE_URL
  }

  // Intentar construir la URL desde las variables de Postgres disponibles
  const host = process.env.POSTGRES_HOST

  if (host) {
    // Construir URL de Supabase desde el host de Postgres
    // Formato típico: https://[project-ref].supabase.co
    const projectRef = host.split(".")[0]
    return `https://${projectRef}.supabase.co`
  }

  // Fallback: intentar extraer desde POSTGRES_URL
  const postgresUrl = process.env.POSTGRES_URL
  if (postgresUrl) {
    try {
      const url = new URL(postgresUrl)
      const projectRef = url.hostname.split(".")[0]
      return `https://${projectRef}.supabase.co`
    } catch (error) {
      console.error("Error parsing POSTGRES_URL:", error)
    }
  }

  return null
}

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  try {
    const supabaseUrl = getSupabaseUrl()
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      // Capturar el país del usuario incluso sin Supabase
      const country = req.geo?.country || req.headers.get("x-vercel-ip-country") || "XX"
      res.cookies.set("user-country", country, {
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
        sameSite: "lax",
      })
      return res
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value))
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    })

    // Refrescar la sesión
    const { data: { user } } = await supabase.auth.getUser()

    // Capturar el país del usuario desde los headers de Vercel
    const country = req.geo?.country || req.headers.get("x-vercel-ip-country") || "XX"

    // Establecer el país en una cookie para usarlo en el cliente
    res.cookies.set("user-country", country, {
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
    })

    // Si el usuario está autenticado, actualizar su perfil con el país
    if (user) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("country")
          .eq("id", user.id)
          .maybeSingle()

        if (!profileError && profile && (profile.country === "XX" || !profile.country)) {
          await supabase.from("profiles").update({ country }).eq("id", user.id)
        }
      } catch (error) {
        // Silently fail profile update
      }
    }
  } catch (error) {
    console.error("Error inesperado en middleware:", error)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
