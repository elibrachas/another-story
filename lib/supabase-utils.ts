import type { PostgrestError } from "@supabase/supabase-js"

// Función para manejar errores de Supabase de manera consistente
export function handleSupabaseError(error: PostgrestError | null, context: string): void {
  if (!error) return

  // Manejar específicamente errores 406
  if (error.code === "406") {
    console.error(`Error 406 en ${context}: La respuesta no coincide con el formato solicitado. Detalles:`, error)
    return
  }

  // Manejar otros errores comunes
  console.error(`Error en ${context}:`, error)
}

// Función para verificar si un objeto está vacío
export function isEmptyObject(obj: any): boolean {
  return obj === null || obj === undefined || Object.keys(obj).length === 0
}

// Función para manejar respuestas de Supabase de manera segura
export function safelyHandleSupabaseResponse<T>(
  data: T | null,
  error: PostgrestError | null,
  context: string,
  defaultValue: T,
): T {
  if (error) {
    handleSupabaseError(error, context)
    return defaultValue
  }

  if (data === null || (Array.isArray(data) && data.length === 0) || isEmptyObject(data)) {
    return defaultValue
  }

  return data
}
