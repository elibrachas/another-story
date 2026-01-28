/**
 * Obtiene la URL base correcta para redirecciones
 * En producción usa el dominio configurado, en desarrollo usa localhost
 */
export function getBaseUrl(): string {
  // En el servidor (SSR), usar la variable de entorno
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : "http://localhost:3000"
  }

  // En el cliente, verificar si estamos en producción
  if (window.location.hostname === "cronicaslaborales.com" || window.location.hostname.includes("vercel.app")) {
    return `https://${window.location.hostname}`
  }

  // Para desarrollo local
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return `http://${window.location.host}`
  }

  // Fallback al origin actual
  return window.location.origin
}

/**
 * Construye la URL de callback para autenticación
 */
export function buildAuthCallbackUrl(next?: string): string {
  const baseUrl = getBaseUrl()
  const nextParam = next ? `?next=${encodeURIComponent(next)}` : ""
  return `${baseUrl}/auth/callback${nextParam}`
}
