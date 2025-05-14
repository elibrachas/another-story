"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/auth-js"

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (provider: "google") => Promise<void>
  signInWithMagicLink: (email: string) => Promise<void>
  signOut: () => Promise<void>
  refreshSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  // Función para refrescar la sesión manualmente
  const refreshSession = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error("Error al refrescar la sesión:", error)
        return false
      }
      setUser(data.session?.user || null)
      return true
    } catch (error) {
      console.error("Error inesperado al refrescar la sesión:", error)
      return false
    }
  }

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error al obtener la sesión:", error)
          // Intentar refrescar la sesión si hay un error
          const refreshed = await refreshSession()
          if (!refreshed) {
            // Si no se pudo refrescar, limpiar el estado
            setUser(null)
          }
        } else {
          setUser(session?.user || null)
        }
      } catch (error) {
        console.error("Error inesperado al obtener la sesión:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Evento de autenticación:", event)

        if (event === "TOKEN_REFRESHED") {
          console.log("Token refrescado exitosamente")
        }

        if (event === "SIGNED_OUT") {
          // Limpiar cualquier dato local al cerrar sesión
          localStorage.removeItem("supabase.auth.token")
        }

        setUser(session?.user || null)
      })

      return () => subscription.unsubscribe()
    }

    getUser()
  }, [supabase.auth])

  const signIn = async (provider: "google") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const signInWithMagicLink = async (email: string) => {
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      // Limpiar cualquier dato local al cerrar sesión
      localStorage.removeItem("supabase.auth.token")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithMagicLink, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
