/**
 * Utilidad para crear un cliente de Supabase con permisos de administrador
 * Este archivo centraliza el uso de la clave de servicio para mejorar la seguridad
 */

import { createClient } from "@supabase/supabase-js"

export function createAdminClient() {
  // Verificar que no estamos en el cliente (navegador)
  if (typeof window !== "undefined") {
    throw new Error("createAdminClient no debe ser llamado en el cliente. Este método solo debe usarse en el servidor.")
  }

  // Verificar que las variables de entorno necesarias están configuradas
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL no está configurado")
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY no está configurado")
  }

  // Crear y devolver el cliente con la clave de servicio
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false, // No persistir la sesión, más seguro para operaciones administrativas
    },
  })
}
