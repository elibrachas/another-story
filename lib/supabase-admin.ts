import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Story, AdminComment, AdminUser, AdminStats } from "./types"
import { isAuthorizedAdmin } from "./admin-utils"

// Función auxiliar para verificar la autorización del administrador
async function verifyAdminAccess(supabase: any) {
  const { data } = await supabase.auth.getUser()
  if (!data.user || !isAuthorizedAdmin(data.user.email)) {
    throw new Error("No autorizado")
  }
}

export async function getAdminStories() {
  const supabase = createServerComponentClient({ cookies })

  // Verificar si el usuario es administrador
  await verifyAdminAccess(supabase)

  const { data: stories } = await supabase
    .from("stories")
    .select(`
      *,
      story_tags(
        tags(id, name)
      )
    `)
    .eq("published", false)
    .order("created_at", { ascending: false })

  if (!stories) return []

  // Formatear los resultados para que coincidan con la estructura esperada
  const formattedStories = stories.map((story) => {
    const tags = story.story_tags?.map((st) => st.tags) || []
    return {
      ...story,
      tags,
    }
  })

  return formattedStories as Story[]
}

export async function getAdminComments() {
  const supabase = createServerComponentClient({ cookies })

  // Verificar si el usuario es administrador
  await verifyAdminAccess(supabase)

  // En un sistema real, tendríamos un campo 'approved' para los comentarios
  // Por ahora, asumimos que todos los comentarios están aprobados
  const { data: comments } = await supabase
    .from("comments")
    .select(`
      *,
      stories(title)
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  if (!comments) return []

  // Formatear los comentarios para incluir el título de la historia
  const formattedComments = comments.map((comment) => ({
    ...comment,
    story_title: comment.stories?.title || "Historia desconocida",
    approved: true, // En un sistema real, esto vendría de la base de datos
  }))

  return formattedComments as AdminComment[]
}

export async function getAdminUsers() {
  const supabase = createServerComponentClient({ cookies })

  // Verificar si el usuario es administrador
  await verifyAdminAccess(supabase)

  // En un sistema real, tendríamos campos 'is_admin' e 'is_banned' en la tabla de perfiles
  const { data: users } = await supabase
    .from("profiles")
    .select(`
      *,
      auth_users:id(email)
    `)
    .order("created_at", { ascending: false })

  if (!users) return []

  // Obtener conteos de historias y comentarios para cada usuario
  const userIds = users.map((user) => user.id)

  const { data: storyCounts } = await supabase
    .from("stories")
    .select("user_id, count")
    .in("user_id", userIds)
    .group("user_id")

  const { data: commentCounts } = await supabase
    .from("comments")
    .select("user_id, count")
    .in("user_id", userIds)
    .group("user_id")

  // Crear un mapa de conteos por usuario
  const storyCountMap: Record<string, number> = {}
  const commentCountMap: Record<string, number> = {}

  storyCounts?.forEach((item) => {
    storyCountMap[item.user_id] = Number.parseInt(item.count)
  })

  commentCounts?.forEach((item) => {
    commentCountMap[item.user_id] = Number.parseInt(item.count)
  })

  // Formatear los usuarios con la información adicional
  const formattedUsers = users.map((user) => ({
    id: user.id,
    email: user.auth_users?.email || "Email desconocido",
    username: user.username || null,
    created_at: user.created_at,
    is_admin: isAuthorizedAdmin(user.auth_users?.email), // Determinar si es admin basado en el email
    is_banned: false, // En un sistema real, esto vendría de la base de datos
    stories_count: storyCountMap[user.id] || 0,
    comments_count: commentCountMap[user.id] || 0,
  }))

  return formattedUsers as AdminUser[]
}

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = createServerComponentClient({ cookies })

  // Verificar si el usuario es administrador
  await verifyAdminAccess(supabase)

  // Obtener estadísticas de historias
  const { count: totalStories } = await supabase.from("stories").select("*", { count: "exact", head: true })

  const { count: pendingStories } = await supabase
    .from("stories")
    .select("*", { count: "exact", head: true })
    .eq("published", false)

  // Obtener estadísticas de comentarios
  const { count: totalComments } = await supabase.from("comments").select("*", { count: "exact", head: true })

  // En un sistema real, tendríamos un campo para comentarios pendientes
  const pendingComments = 0

  // Obtener estadísticas de usuarios
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count: newUsersToday } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString())

  // Obtener estadísticas de votos
  const { count: totalUpvotes } = await supabase.from("upvotes").select("*", { count: "exact", head: true })

  const { count: upvotesToday } = await supabase
    .from("upvotes")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString())

  return {
    total_stories: totalStories || 0,
    pending_stories: pendingStories || 0,
    total_comments: totalComments || 0,
    pending_comments: pendingComments,
    total_users: totalUsers || 0,
    new_users_today: newUsersToday || 0,
    total_upvotes: totalUpvotes || 0,
    upvotes_today: upvotesToday || 0,
  }
}
