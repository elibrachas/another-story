"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase-provider"
import { Mail, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoginSuccess?: () => void
}

export function LoginDialog({ open, onOpenChange, onLoginSuccess }: LoginDialogProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const { supabase } = useSupabase()
  const { toast } = useToast()

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      // No podemos llamar a onLoginSuccess aquí porque la redirección ocurre antes
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error)
      toast({
        title: "Error",
        description: "No se pudo iniciar sesión con Google",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
        },
      })

      if (error) {
        console.error("Error al enviar OTP:", error)
        throw error
      }

      setShowConfirmation(true)
      toast({
        title: "Enlace enviado",
        description: "Revisa tu correo electrónico para iniciar sesión",
      })
    } catch (error: any) {
      console.error("Error al enviar enlace mágico:", error)

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
          description: "No se pudo enviar el enlace de inicio de sesión",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendLink = async () => {
    if (!email.trim()) return

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
        },
      })

      if (error) throw error

      toast({
        title: "Enlace reenviado",
        description: "Hemos enviado un nuevo enlace a tu correo",
      })
    } catch (error: any) {
      if (error.message?.includes("rate limit")) {
        toast({
          title: "Demasiados intentos",
          description: "Por favor, espera unos minutos antes de solicitar otro enlace.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo reenviar el enlace",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setShowConfirmation(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetForm()
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{showConfirmation ? "Revisa tu correo" : "Iniciar sesión"}</DialogTitle>
          <DialogDescription>
            {showConfirmation
              ? `Hemos enviado un enlace mágico a ${email}. Haz clic en el enlace para iniciar sesión.`
              : "Inicia sesión para votar historias y compartir tus experiencias"}
          </DialogDescription>
        </DialogHeader>

        {showConfirmation ? (
          <div className="flex flex-col gap-4 py-4">
            <div className="bg-muted p-4 rounded-md text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                El enlace expirará en 1 hora. Si no lo encuentras, revisa tu carpeta de spam.
              </p>
            </div>

            <Button variant="outline" onClick={handleResendLink} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reenviando...
                </>
              ) : (
                "Reenviar enlace"
              )}
            </Button>

            <Button variant="ghost" onClick={() => setShowConfirmation(false)} className="w-full">
              Usar otro correo
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-4">
            <Button variant="outline" onClick={handleGoogleSignIn} disabled={isLoading} className="w-full">
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
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" /> Enviar enlace mágico
                  </>
                )}
              </Button>
            </form>

            <div className="text-xs text-muted-foreground text-center mt-2">
              Al iniciar sesión, aceptas nuestros{" "}
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
        )}
      </DialogContent>
    </Dialog>
  )
}
