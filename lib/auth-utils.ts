/**
 * Utilidades para verificación de autenticación y permisos
 */

import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Verifica si un usuario es administrador
 */
export async function isAdmin(supabase: SupabaseClient, userId: string) {
  try {
    const { data, error } = await supabase.from("profiles").select("admin").eq("id", userId).single()

    if (error) {
      console.error("Error al verificar permisos de administrador:", error)
      return { isAdmin: false, error: "Error al verificar permisos" }
    }

    return { isAdmin: !!data?.admin, error: data?.admin ? null : "No tienes permisos de administrador" }
  } catch (error) {
    console.error("Error inesperado al verificar permisos:", error)
    return { isAdmin: false, error: "Error interno al verificar permisos" }
  }
}

/**
 * Verifica autenticación y permisos de administrador en un solo paso
 * Útil para rutas API que requieren permisos de administrador
 */
export async function verifyAdminAccess(supabase: SupabaseClient) {
  try {
    // Verificar autenticación
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      return { authorized: false, error: "No autenticado" }
    }

    // Verificar permisos de administrador
    const adminCheck = await isAdmin(supabase, userData.user.id)

    if (!adminCheck.isAdmin) {
      return { authorized: false, error: adminCheck.error || "No tienes permisos de administrador" }
    }

    // Usuario autenticado y con permisos de administrador
    return { authorized: true, userId: userData.user.id }
  } catch (error) {
    console.error("Error inesperado en verificación de acceso:", error)
    return { authorized: false, error: "Error interno del servidor" }
  }
}

/**
 * Limpia los tokens almacenados localmente
 */
export const clearAuthTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("supabase.auth.token")
    // Limpiar cualquier otra información de autenticación almacenada
    sessionStorage.removeItem("supabase.auth.token")
    document.cookie.split(";").forEach((cookie) => {
      const [name] = cookie.split("=")
      if (name.trim().startsWith("sb-")) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      }
    })
  }
}

/**
 * Verifica si un token está próximo a expirar
 * @param expiryTime Tiempo de expiración en segundos desde epoch
 * @param thresholdMinutes Minutos antes de la expiración para considerar el token como próximo a expirar
 */
export const isTokenExpiringSoon = (expiryTime: number, thresholdMinutes = 5): boolean => {
  if (!expiryTime) return true

  const expiryDate = new Date(expiryTime * 1000)
  const now = new Date()
  const thresholdMs = thresholdMinutes * 60 * 1000

  return expiryDate.getTime() - now.getTime() < thresholdMs
}
