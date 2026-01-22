import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { generateUsername } from "@/lib/username-generator"

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

  // Si no hay código, simplemente redirigir a home
  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/`)
  }

  // Almacenar cookies que necesitamos setear
  const cookiesToSet: { name: string; value: string; options: CookieOptions }[] = []

  // Log de cookies existentes en el request
  console.log("[v0] Cookies en request:", request.cookies.getAll().map(c => c.name))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookies) {
          console.log("[v0] setAll llamado con cookies:", cookies.map(c => c.name))
          cookies.forEach((cookie) => {
            cookiesToSet.push(cookie)
          })
        },
      },
    }
  )

  try {
    // Intercambiar el código por una sesión
    console.log("[v0] Intercambiando código por sesión...")
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error("[v0] Error al intercambiar código por sesión:", sessionError)
      return NextResponse.redirect(
        `${requestUrl.origin}/auth?error=session_exchange&message=${encodeURIComponent(sessionError.message)}`,
      )
    }

    console.log("[v0] Sesión obtenida:", data?.session ? "SI" : "NO")
    console.log("[v0] User ID:", data?.session?.user?.id)
    console.log("[v0] Cookies a setear:", cookiesToSet.map(c => c.name))

    // Crear la respuesta de redirección
    const response = NextResponse.redirect(`${requestUrl.origin}/`)

    // Aplicar todas las cookies a la respuesta
    for (const { name, value, options } of cookiesToSet) {
      console.log("[v0] Seteando cookie:", name, "options:", JSON.stringify(options))
      response.cookies.set(name, value, options)
    }

    // Crear perfil si no existe (usando el cliente ya autenticado)
    if (data?.session?.user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.session.user.id)
        .maybeSingle()

      if (!profileData) {
        const username = generateUsername()
        await supabase.from("profiles").insert({
          id: data.session.user.id,
          username: username,
          country: "XX",
          admin: false,
        })
      }
    }

    return response
  } catch (error) {
    console.error("Error inesperado en callback:", error)
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=unexpected`)
  }
}
