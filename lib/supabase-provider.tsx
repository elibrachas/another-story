"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient, Session } from "@supabase/supabase-js"

type SupabaseContext = {
  supabase: SupabaseClient
  session: Session | null
}

const Context = createContext<SupabaseContext | undefined>(undefined)

// Función para obtener la URL de Supabase desde las variables disponibles
function getSupabaseUrl() {
  // Usar la variable de entorno estándar de Supabase (disponible en cliente)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  
  if (supabaseUrl) {
    return supabaseUrl
  }

  throw new Error("NEXT_PUBLIC_SUPABASE_URL no está configurada")
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const supabaseUrl = getSupabaseUrl()
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseAnonKey) {
        throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY no encontrada")
      }

      const client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })

      setSupabase(client)

      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((_, session) => {
        setSession(session)
      })

      client.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
      })

      return () => {
        subscription.unsubscribe()
      }
    } catch (err) {
      console.error("Error inicializando Supabase:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    }
  }, [])

  // Si hay error o no hay cliente, renderizar children sin provider
  if (error || !supabase) {
    console.warn("SupabaseProvider no disponible:", error)
    return <>{children}</>
  }

  return <Context.Provider value={{ supabase, session }}>{children}</Context.Provider>
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    // En lugar de lanzar error, devolver valores por defecto
    console.warn("useSupabase usado fuera de SupabaseProvider")
    return { supabase: null, session: null }
  }
  return context
}
