import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Función para crear un cliente de Supabase con opciones personalizadas
export function createSupabaseClient(supabaseUrl: string, supabaseKey: string) {
  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}

// Funciones de utilidad para trabajar con la base de datos
export async function executeSQL(sql: string, supabase: any) {
  try {
    const { data, error } = await supabase.rpc("execute_sql", { sql_query: sql })
    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error("Error ejecutando SQL:", error)
    return { data: null, error }
  }
}

// Rutas a los archivos de migración
export const migrationFiles = {
  schemaSetup: "/db/migrations/001-schema-setup.sql",
  rlsPolicies: "/db/migrations/002-rls-policies.sql",
  upvoteSystem: "/db/migrations/003-upvote-system.sql",
  adminFunctions: "/db/migrations/004-admin-functions.sql",
  privateStories: "/db/migrations/005-private-stories.sql",
}

// Exportar funciones específicas para diferentes dominios
export const dbFunctions = {
  // Funciones para historias
  stories: {
    approvePending: "approve_story",
    rejectStory: "reject_story",
    getPendingStories: "get_pending_stories",
    checkApprovalStatus: "check_story_approval_status",
  },

  // Funciones para upvotes
  upvotes: {
    incrementUpvotes: "increment_story_upvotes",
    countUpvotes: "count_story_upvotes",
  },

  // Funciones para administración
  admin: {
    processApproval: "process_story_approval",
    bypassRLS: "admin_can_bypass_rls",
  },

  // Funciones para etiquetas
  tags: {
    countByTag: "count_stories_by_tag",
  },

  // Funciones de utilidad
  utils: {
    getTableInfo: "get_table_info",
  },
}
