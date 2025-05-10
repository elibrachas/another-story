// Función para aprobar una historia usando directamente la API de Supabase
export async function approveStoryDirectAPI(storyId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cfeeyqnwrqmpqidnryfp.supabase.co"
    const SUPABASE_ANON_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZmV5cW53cnFtcHFpZG5yeWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3OTY0NzAsImV4cCI6MjA2MjM3MjQ3MH0.cS2jdk5l2VCoF7Xw3W-VojHpdRSDTvjEC0IjpPGA9Gw"

    // Obtener el token de autenticación de las cookies
    const cookies = document.cookie.split(";").reduce(
      (acc, cookie) => {
        const [key, value] = cookie.trim().split("=")
        acc[key] = value
        return acc
      },
      {} as Record<string, string>,
    )

    const authToken = cookies["sb-access-token"] || ""

    // Hacer la solicitud directa a la API de Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/stories?id=eq.${storyId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${authToken}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify({ published: true }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Error en la respuesta de la API:", errorData)
      return { success: false, error: `Error ${response.status}: ${JSON.stringify(errorData)}` }
    }

    const data = await response.json()
    console.log("Respuesta de la API:", data)

    return { success: true }
  } catch (error) {
    console.error("Error al llamar a la API de Supabase:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido al llamar a la API",
    }
  }
}
