"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { isAuthorizedAdmin } from "./admin-utils"

/**
 * Función para verificar el estado de una historia específica
 * Solo accesible para administradores
 */
export async function checkStoryStatus(storyId: string) {
  const supabase = createServerActionClient({ cookies })

  // Usar getUser() en lugar de getSession()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    throw new Error("No autenticado")
  }

  // Verificar si el usuario es administrador
  if (!isAuthorizedAdmin(userData.user.email)) {
    throw new Error("No autorizado")
  }

  // Obtener el estado actual de la historia
  const { data: story, error } = await supabase.from("stories").select("*").eq("id", storyId).single()

  if (error) {
    console.error("Error al verificar estado de historia:", error)
    throw new Error(error.message)
  }

  return {
    id: story.id,
    title: story.title,
    published: story.published,
    created_at: story.created_at,
    updated_at: new Date().toISOString(),
  }
}

/**
 * Función para listar todas las historias y su estado de publicación
 * Solo accesible para administradores
 */
export async function listAllStories() {
  const supabase = createServerActionClient({ cookies })

  // Usar getUser() en lugar de getSession()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) {
    throw new Error("No autenticado")
  }

  // Verificar si el usuario es administrador
  if (!isAuthorizedAdmin(userData.user.email)) {
    throw new Error("No autorizado")
  }

  // Obtener todas las historias
  const { data: stories, error } = await supabase
    .from("stories")
    .select("id, title, published, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error al listar historias:", error)
    throw new Error(error.message)
  }

  return stories
}
