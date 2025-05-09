"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { isAuthorizedAdmin } from "./admin-utils"

/**
 * Función para forzar la publicación de una historia directamente
 * Solo para uso de administradores en caso de emergencia
 */
export async function forcePublishStory(storyId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    throw new Error("No autenticado")
  }

  // Verificar si el usuario es administrador
  if (!isAuthorizedAdmin(userData.user.email)) {
    throw new Error("No autorizado")
  }

  console.log(`Forzando publicación de historia con ID: ${storyId}`)

  // Actualizar directamente en la base de datos
  const { data, error } = await supabase.from("stories").update({ published: true }).eq("id", storyId).select()

  if (error) {
    console.error("Error al forzar publicación:", error)
    throw new Error(`Error al forzar publicación: ${error.message}`)
  }

  return { success: true, data }
}

/**
 * Función para verificar el estado actual de una historia
 */
export async function checkStoryPublishStatus(storyId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    throw new Error("No autenticado")
  }

  // Verificar si el usuario es administrador
  if (!isAuthorizedAdmin(userData.user.email)) {
    throw new Error("No autorizado")
  }

  // Consultar directamente la base de datos
  const { data, error } = await supabase
    .from("stories")
    .select("id, title, published, created_at, updated_at")
    .eq("id", storyId)
    .single()

  if (error) {
    console.error("Error al verificar estado:", error)
    throw new Error(`Error al verificar estado: ${error.message}`)
  }

  return data
}
