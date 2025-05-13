import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { verifyAdminAccess } from "@/lib/auth-utils"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    // Verificar autenticación y permisos de administrador
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    const accessCheck = await verifyAdminAccess(supabase)

    if (!accessCheck.authorized) {
      return NextResponse.json(
        { success: false, error: accessCheck.error },
        { status: accessCheck.error === "No autenticado" ? 401 : 403 },
      )
    }

    // Verificar que la API key de OpenAI esté configurada
    if (!process.env.OPENAI_API_KEY) {
      console.error("API key de OpenAI no configurada")
      return NextResponse.json({ success: false, error: "Configuración incompleta del servidor" }, { status: 500 })
    }

    // Obtener el contenido del cuerpo de la solicitud
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ success: false, error: "Contenido no proporcionado" }, { status: 400 })
    }

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
            "- No incluyas tu comentario en la respuesta, solo la historia corregida\n" +
            "- La historia debe tener como máximo 1800 caracteres. Si sobrepasa este largo debes resumirla para que tenga entre 1600 y 1800 caracteres",
        },
        {
          role: "user",
          content,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
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
