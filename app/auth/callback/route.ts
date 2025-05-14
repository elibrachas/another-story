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
    await supabase.auth.exchangeCodeForSession(code)

    // Intentar crear el perfil inicial después de la autenticación
    try {
      console.log("Intentando crear perfil inicial desde callback...")
      const result = await createInitialProfile()
      console.log("Resultado de createInitialProfile:", result)
    } catch (error) {
      console.error("Error al crear perfil inicial desde callback:", error)
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin)
}
