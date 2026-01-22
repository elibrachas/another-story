import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { createInitialProfile } from "@/lib/actions"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")
  const next = requestUrl.searchParams.get("next") || "/"

  // Si hay un error en la URL, redirigir a la página de error
  if (error) {
    console.error(`Error en callback de autenticación: ${error} - ${errorDescription}`)
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=${error}&error_description=${errorDescription}`)
  }

  // Si no hay código, simplemente redirigir a home (el usuario puede ya estar autenticado vía cookies)
  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}${next}`)
  }

  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignorar errores al setear cookies en Server Components
          }
        },
      },
    }
  )

  try {
    // Intercambiar el código por una sesión
    const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

    if (sessionError) {
      console.error("Error al intercambiar código por sesión:", sessionError)

      // Redirigir a una página de error con información específica
      return NextResponse.redirect(
        `${requestUrl.origin}/auth?error=session_exchange&message=${encodeURIComponent(sessionError.message)}`,
      )
    }

    console.log("Sesión creada exitosamente para usuario:", data?.session?.user?.id)

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

          if (!result.success) {
            console.error("Error al crear perfil inicial:", result.error)
            return NextResponse.redirect(
              `${requestUrl.origin}/auth?error=profile_creation&message=${encodeURIComponent(result.error || "Error al crear perfil")}`,
            )
          }
        } else {
          console.log("Perfil ya existe, no es necesario crearlo")
        }
      } catch (profileError) {
        console.error("Error al verificar o crear perfil:", profileError)
        // Continuar con la redirección aunque haya error en la creación del perfil
      }
    }

    // Validar el parámetro next antes de usarlo para la redirección
    let nextPath = next || "/"

    // Asegurarse de que next es una ruta relativa y no una URL externa
    if (nextPath.startsWith("http") || nextPath.startsWith("//")) {
      console.warn("Intento de redirección a URL externa detectado:", nextPath)
      nextPath = "/"
    }

    // Asegurar que la ruta comience con /
    if (!nextPath.startsWith("/")) {
      nextPath = "/" + nextPath
    }

    const finalRedirectUrl = `${requestUrl.origin}${nextPath}`
    console.log("Redirigiendo a:", finalRedirectUrl)

    // Redirigir al destino original o a la página principal por defecto
    return NextResponse.redirect(finalRedirectUrl)
  } catch (error) {
    console.error("Error inesperado en callback:", error)
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=unexpected`)
  }
}
