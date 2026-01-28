"use client"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ConnectionErrorProps {
  message?: string
  onRetry?: () => void
  loading?: boolean
}

export function ConnectionError({
  message = "Error de conexión. Por favor, inténtalo de nuevo más tarde.",
  onRetry,
  loading = false,
}: ConnectionErrorProps) {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4 mr-2" />
      <AlertTitle>Error de conexión</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="ml-4" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Reintentar
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
