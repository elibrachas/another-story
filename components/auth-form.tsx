"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { createInitialProfile } from "@/lib/actions"
import Link from "next/link"

export function AuthForm() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()

  // Crear perfil inicial cuando el usuario se autentica
  useEffect(() => {
    const checkAndCreateProfile = async () => {
      try {
        setIsCreatingProfile(true)
        const { data } = await supabase.auth.getSession()

        if (data.session) {
          console.log("Usuario autenticado, verificando si ya existe perfil...")

          // Primero verificar si ya existe un perfil para evitar creaciones duplicadas
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", data.session.user.id)
            .single()

          if (profileError && profileError.code !== "PGRST116") {
            console.error("Error al verificar perfil existente:", profileError)
          }

          // Solo crear perfil si no existe
          if (!profileData) {
            console.log("Perfil no encontrado, creando uno nuevo...")
            const result = await createInitialProfile()

            if (result.success) {
              console.log("Perfil creado exitosamente")
            } else {
              console.error("Error al crear perfil:", result.error)
              toast({
                title: "Error",
                description: "No se pudo crear tu perfil. Por favor, intenta recargar la página.",
                variant: "destructive",
              })
            }
          } else {
            console.log("Perfil ya existe, no es necesario crearlo")
          }
        }
      } catch (error) {
        console.error("Error al verificar sesión o crear perfil:", error)
      } finally {
        setIsCreatingProfile(false)
      }
    }

    checkAndCreateProfile()
  }, [supabase, toast])

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al iniciar sesión con Google",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          // Asegurarse de que se creen usuarios nuevos si no existen
          shouldCreateUser: true,
        },
      })

      if (error) {
        console.error("Error al enviar OTP:", error)
        throw error
      }

      toast({
        title: "Enlace enviado",
        description: "Revisa tu correo electrónico para iniciar sesión. El enlace es válido por 1 hora.",
      })
    } catch (error: any) {
      console.error("Error detallado:", error)

      // Mensajes de error más específicos
      if (error.message?.includes("rate limit")) {
        toast({
          title: "Demasiados intentos",
          description:
            "Has excedido el límite de intentos. Por favor, espera unos minutos antes de intentarlo nuevamente.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo enviar el enlace de inicio de sesión: " + (error.message || "Error desconocido"),
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {isCreatingProfile && (
        <Alert>
          <AlertTitle>Configurando tu perfil...</AlertTitle>
          <AlertDescription>Estamos configurando tu perfil anónimo. Por favor, espera un momento.</AlertDescription>
        </Alert>
      )}

      <Alert variant="warning">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Importante: Protege tu privacidad</AlertTitle>
        <AlertDescription>
          Para proteger tu identidad, te asignaremos automáticamente un nombre de usuario anónimo. No uses tu nombre
          real al compartir historias o comentarios.
        </AlertDescription>
      </Alert>

      <Button
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={isLoading || isCreatingProfile}
        className="w-full"
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
          <path d="M1 1h22v22H1z" fill="none" />
        </svg>
        Continuar con Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">O continuar con</span>
        </div>
      </div>

      <form onSubmit={handleMagicLinkSignIn} className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="nombre@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={isLoading || isCreatingProfile}
        >
          {isLoading ? "Enviando..." : "Enviar enlace mágico"}
        </Button>
      </form>

      <div className="text-xs text-muted-foreground text-center mt-4">
        Al crear una cuenta o iniciar sesión, aceptas nuestros{" "}
        <Link href="/terminos-de-servicio" className="text-purple-500 hover:underline">
          Términos de Servicio
        </Link>{" "}
        y{" "}
        <Link href="/politica-de-privacidad" className="text-purple-500 hover:underline">
          Política de Privacidad
        </Link>
        .
      </div>
    </div>
  )
}
