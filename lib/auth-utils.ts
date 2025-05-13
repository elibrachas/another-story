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
