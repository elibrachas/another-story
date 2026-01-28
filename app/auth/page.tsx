"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { useSearchParams } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function AuthPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")
  const message = searchParams.get("message")
  const success = searchParams.get("auth_success")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Mostrar mensajes de error si existen en los parámetros de URL
    if (error) {
      let errorMessage = "Ha ocurrido un error durante la autenticación."

      switch (error) {
        case "no_code":
          errorMessage = "No se encontró el código de autenticación."
          break
        case "session_exchange":
          errorMessage = "Error al procesar la autenticación: " + (message || errorDescription || "")
          break
        case "unexpected":
          errorMessage = "Ha ocurrido un error inesperado. Por favor, intenta nuevamente."
          break
        default:
          errorMessage = errorDescription || message || "Error desconocido."
      }

      toast({
        title: "Error de autenticación",
        description: errorMessage,
        variant: "destructive",
      })
    }

    // Mostrar mensaje de éxito si la autenticación fue exitosa
    if (success === "true") {
      toast({
        title: "Autenticación exitosa",
        description: "Has iniciado sesión correctamente.",
        variant: "default",
      })

      // Notificar a otras pestañas que la autenticación fue exitosa
      localStorage.setItem("auth_success_event", Date.now().toString())

      // Redirigir al panel de control después de un breve retraso
      const timer = setTimeout(() => {
        router.replace("/dashboard")
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [error, errorDescription, message, success, toast, router])

  return (
    <div className="container max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Iniciar sesión o registrarse</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error de autenticación</AlertTitle>
          <AlertDescription>
            {error === "no_code" && "No se encontró el código de autenticación."}
            {error === "session_exchange" && `Error al procesar la autenticación: ${message || errorDescription || ""}`}
            {error === "unexpected" && "Ha ocurrido un error inesperado. Por favor, intenta nuevamente."}
            {!["no_code", "session_exchange", "unexpected"].includes(error) &&
              (errorDescription || message || "Error desconocido.")}
          </AlertDescription>
        </Alert>
      )}

      {success === "true" && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Autenticación exitosa</AlertTitle>
          <AlertDescription className="text-green-700">Has iniciado sesión correctamente.</AlertDescription>
        </Alert>
      )}

      <AuthForm />
    </div>
  )
}
