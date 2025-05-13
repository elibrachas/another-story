"use client"

import { useState, useEffect } from "react"
import { WifiOff, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { clearCache } from "@/lib/supabase-client"

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)

  useEffect(() => {
    // Verificar estado inicial
    setIsOffline(!navigator.onLine)

    // Configurar event listeners
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleReconnect = async () => {
    setIsReconnecting(true)

    try {
      // Limpiar caché para forzar recarga de datos
      clearCache()

      // Intentar hacer una solicitud simple para verificar conectividad
      const response = await fetch("/api/debug/connection", {
        method: "GET",
        cache: "no-store",
      })

      if (response.ok) {
        setIsOffline(false)
        // Recargar la página para obtener datos frescos
        window.location.reload()
      } else {
        throw new Error("No se pudo conectar al servidor")
      }
    } catch (error) {
      console.error("Error al intentar reconectar:", error)
    } finally {
      setIsReconnecting(false)
    }
  }

  if (!isOffline) return null

  return (
    <Alert variant="destructive" className="mb-6">
      <WifiOff className="h-4 w-4 mr-2" />
      <AlertTitle>Problemas de conexión</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>Estás viendo contenido almacenado en caché. Algunas funciones pueden no estar disponibles.</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReconnect}
          disabled={isReconnecting}
          className="ml-4 whitespace-nowrap"
        >
          {isReconnecting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Reconectando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reconectar
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  )
}
