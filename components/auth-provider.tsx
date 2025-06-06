"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from "@supabase/auth-js"
import { clearAuthTokens, isTokenExpiringSoon } from "@/lib/auth-utils"
import { buildAuthCallbackUrl } from "@/lib/url-utils"

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
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      console.log("Intentando refrescar la sesión...")
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        console.error("Error al refrescar la sesión:", error)

        // Si el error es por token inválido o expirado, limpiar tokens y estado
        if (error.message?.includes("token") || error.status === 400) {
          console.log("Token inválido o expirado, limpiando estado de autenticación...")
          clearAuthTokens()
          setUser(null)
        }

        return false
      }

      console.log("Sesión refrescada exitosamente")
      setUser(data.session?.user || null)
      return true
    } catch (error) {
      console.error("Error inesperado al refrescar la sesión:", error)
      return false
    }
  }, [supabase.auth])

  // Verificar periódicamente si el token está por expirar
  useEffect(() => {
    let checkInterval: NodeJS.Timeout | null = null

    const setupTokenRefresh = async () => {
      try {
        const { data } = await supabase.auth.getSession()

        if (data.session) {
          // Configurar verificación periódica del token
          checkInterval = setInterval(async () => {
            const { data: currentData } = await supabase.auth.getSession()

            if (currentData.session && isTokenExpiringSoon(currentData.session.expires_at || 0)) {
              console.log("Token próximo a expirar, refrescando...")
              await refreshSession()
            }
          }, 60000) // Verificar cada minuto
        }
      } catch (error) {
        console.error("Error al configurar verificación de token:", error)
      }
    }

    setupTokenRefresh()

    return () => {
      if (checkInterval) clearInterval(checkInterval)
    }
  }, [supabase.auth, refreshSession])

  // Separar la obtención inicial del usuario y la suscripción a cambios
  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true)
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
            clearAuthTokens()
            setUser(null)
          }
        } else {
          setUser(session?.user || null)
        }
      } catch (error) {
        console.error("Error inesperado al obtener la sesión:", error)
        clearAuthTokens()
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [supabase.auth, refreshSession])

  // Suscripción a cambios de autenticación en un useEffect separado
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Evento de autenticación:", event)

      if (event === "TOKEN_REFRESHED") {
        console.log("Token refrescado exitosamente")
      } else if (event === "SIGNED_OUT") {
        // Limpiar cualquier dato local al cerrar sesión
        clearAuthTokens()
      } else if (event === "SIGNED_IN") {
        console.log("Usuario ha iniciado sesión")
      } else if (event === "USER_UPDATED") {
        console.log("Datos de usuario actualizados")
      }

      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signIn = async (provider: "google") => {
    try {
      const next = `${window.location.pathname}${window.location.search}`
      const redirectUrl = buildAuthCallbackUrl(next)

      console.log("Iniciando sesión con Google...")
      console.log("URL de redirección:", redirectUrl)
      console.log("Página actual:", next)

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      })

      if (error) {
        console.error("Error al iniciar sesión con Google:", error)
        throw error
      }
    } catch (error) {
      console.error("Error en signIn:", error)
      throw error
    }
  }

  // Actualizar también la función signInWithMagicLink para mantener consistencia
  const signInWithMagicLink = async (email: string) => {
    try {
      const next = `${window.location.pathname}${window.location.search}`
      const redirectUrl = buildAuthCallbackUrl(next)

      console.log("Enviando magic link...")
      console.log("URL de redirección:", redirectUrl)
      console.log("Email:", email)

      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
          // Asegurarse de que se creen usuarios nuevos si no existen
          shouldCreateUser: true,
        },
      })

      if (error) {
        console.error("Error al enviar OTP:", error)
        throw error
      }

      return { success: true }
    } catch (error) {
      console.error("Error en signInWithMagicLink:", error)
      return { success: false, error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      // Limpiar cualquier dato local al cerrar sesión
      clearAuthTokens()
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
