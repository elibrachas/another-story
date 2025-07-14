import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getOpenAIClient } from "@/lib/openai-server"

export async function POST(request: Request) {
  try {
    // Verificar autenticación y permisos de administrador
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Obtener la sesión actual
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !sessionData.session) {
      console.error("Error de sesión:", sessionError || "No hay sesión activa")
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    // Obtener datos del usuario
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      console.error("Error al obtener usuario:", userError)
      return NextResponse.json({ success: false, error: "No autenticado" }, { status: 401 })
    }

    console.log("Usuario autenticado:", userData.user.id)

    // Verificar si el usuario es administrador
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("admin")
      .eq("id", userData.user.id)
      .single()

    if (profileError) {
      console.error("Error al verificar perfil:", profileError)
      return NextResponse.json({ success: false, error: "Error al verificar permisos" }, { status: 500 })
    }

    if (!profileData?.admin) {
      console.error("Usuario no es administrador:", userData.user.id)
      return NextResponse.json({ success: false, error: "No tienes permisos de administrador" }, { status: 403 })
    }

    // Obtener el contenido del cuerpo de la solicitud
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ success: false, error: "Contenido no proporcionado" }, { status: 400 })
    }

    // Obtener el cliente de OpenAI
    const openai = getOpenAIClient()

    // Llamar a la API de OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "Tu tarea es mejorar la historia que te proporcionaré siguiendo estas instrucciones específicas:\n\n" +
            "- Haz correcciones menores de ortografía y sintaxis\n" +
            "- Mantén el tono y la voz original del autor mientras mejoras la claridad y coherencia\n" +
            "- Ordena el flujo de la historia si crees que facilitará su lectura\n" +
            "- Anonimiza las historias cambiando nombres de las personas\n" +
            "- Si hay nombres de empresas debes quitarlos o cambiarlos por otros\n" +
            "- La historia corregida se publicará en una página web\n" +
            "- No incluyas tu comentario en la respuesta, solo la historia corregida\n" +,
        },
        {
          role: "user",
          content,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    })

    const improvedContent = completion.choices[0].message.content

    return NextResponse.json({
      success: true,
      improvedContent,
    })
  } catch (error) {
    console.error("Error en el endpoint de mejora de contenido:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
