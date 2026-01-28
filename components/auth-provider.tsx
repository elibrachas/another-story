"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import type { User, Session } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Función para obtener la URL de Supabase desde las variables disponibles
function getSupabaseUrl() {
  // Intentar construir la URL desde las variables de Postgres disponibles
  const host = process.env.POSTGRES_HOST

  if (host) {
    // Construir URL de Supabase desde el host de Postgres
    // Formato típico: https://[project-ref].supabase.co
    const projectRef = host.split(".")[0]
    return `https://${projectRef}.supabase.co`
  }

  // Fallback: intentar extraer desde POSTGRES_URL
  const postgresUrl = process.env.POSTGRES_URL
  if (postgresUrl) {
    try {
      const url = new URL(postgresUrl)
      const projectRef = url.hostname.split(".")[0]
      return `https://${projectRef}.supabase.co`
    } catch (error) {
      console.error("Error parsing POSTGRES_URL:", error)
    }
  }

  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)

  useEffect(() => {
    try {
      const supabaseUrl = getSupabaseUrl()
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn("Variables de Supabase no disponibles")
        setLoading(false)
        return
      }

      const client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      })

      setSupabase(client)

      // Obtener sesión inicial
      client.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
          console.error("Error obteniendo sesión inicial:", error)
        }
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      })

      // Escuchar cambios de autenticación
      const {
        data: { subscription },
      } = client.auth.onAuthStateChange(async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error("Error inicializando AuthProvider:", error)
      setLoading(false)
    }
  }, [])

  const signOut = async () => {
    if (!supabase) return

    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const value = {
    user,
    session,
    loading,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    return {
      user: null,
      session: null,
      loading: false,
      signOut: async () => {},
    }
  }
  return context
}
