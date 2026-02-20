import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/mi-libro" || req.nextUrl.pathname === "/mi-libro/") {
    const redirectUrl = new URL("https://alcaparra.co/libro-renuncio")
    redirectUrl.search = req.nextUrl.search
    return NextResponse.redirect(redirectUrl, 301)
  }

  // Crear response inicial
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        // Primero setear en el request para que las siguientes llamadas vean los valores actualizados
        cookiesToSet.forEach(({ name, value }) => {
          req.cookies.set(name, value)
        })
        // Crear nueva response con los headers actualizados
        response = NextResponse.next({
          request: {
            headers: req.headers,
          },
        })
        // Setear las cookies en la response para que el navegador las guarde
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  // IMPORTANTE: getUser() refresca el token si es necesario y llama setAll internamente
  // Esto mantiene la sesión activa
  await supabase.auth.getUser()

  // Capturar el país del usuario desde los headers de Vercel
  const country = req.geo?.country || req.headers.get("x-vercel-ip-country") || "XX"
  response.cookies.set("user-country", country, {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
  })

  return response
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
