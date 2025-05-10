"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { isAuthorizedAdmin } from "./admin-utils"

/**
 * Función simplificada para aprobar una historia
 * Esta función solo actualiza el campo published a true en la base de datos
 */
export async function directApproveStory(storyId: string) {
  try {
    console.log(`[DIRECT-APPROVE] Iniciando aprobación directa para historia ID: ${storyId}`)

    // Crear cliente de Supabase
    const supabase = createServerActionClient({ cookies })

    // Verificar autenticación usando getUser() en lugar de getSession()
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      console.error("[DIRECT-APPROVE] Error de autenticación:", userError)
      return { success: false, error: "No autenticado" }
    }

    // Verificar si el usuario es administrador
    if (!isAuthorizedAdmin(userData.user.email)) {
      console.error("[DIRECT-APPROVE] Usuario no autorizado:", userData.user.email)
      return { success: false, error: "No autorizado" }
    }

    // Actualización directa en la base de datos
    const { data, error } = await supabase.from("stories").update({ published: true }).eq("id", storyId)

    if (error) {
      console.error("[DIRECT-APPROVE] Error en la actualización:", error)
      return { success: false, error: error.message }
    }

    console.log("[DIRECT-APPROVE] Actualización exitosa:", data)

    // Revalidar rutas
    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath(`/story/${storyId}`)

    return { success: true, data }
  } catch (error) {
    console.error("[DIRECT-APPROVE] Error inesperado:", error)
    return { success: false, error: String(error) }
  }
}
