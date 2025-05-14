import OpenAI from "openai"

// Esta función solo debe llamarse desde el servidor
export function getOpenAIClient() {
  // Verificar que estamos en el servidor
  if (typeof window !== "undefined") {
    throw new Error("getOpenAIClient debe ser llamado solo desde el servidor")
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY no está configurada")
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}
