"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import Link from "next/link"

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Verificar si el usuario ya ha aceptado las cookies
    const cookieConsent = localStorage.getItem("cookie-consent")

    // Mostrar el banner solo si el usuario no ha tomado una decisión
    if (cookieConsent === null) {
      setShowBanner(true)
    } else if (cookieConsent === "accepted") {
      // Si el usuario ya aceptó las cookies, inicializar Google Analytics
      initializeGoogleAnalytics()
    }
  }, [])

  const initializeGoogleAnalytics = () => {
    // Verificar si gtag ya está definido
    if (typeof window !== "undefined" && window.gtag) {
      // Google Analytics ya está inicializado
      return
    }

    // Inicializar Google Analytics manualmente si es necesario
    // Esto es un respaldo, ya que normalmente los scripts en layout.tsx ya lo habrán inicializado
    try {
      window.dataLayer = window.dataLayer || []
      // @ts-ignore - gtag puede no estar tipado
      window.gtag = () => {
        window.dataLayer.push(arguments)
      }
      // @ts-ignore
      window.gtag("js", new Date())
      // @ts-ignore
      window.gtag("config", "G-1FFHMB6H3P")
    } catch (error) {
      console.error("Error initializing Google Analytics:", error)
    }
  }

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted")
    setShowBanner(false)
    initializeGoogleAnalytics()
  }

  const declineCookies = () => {
    localStorage.setItem("cookie-consent", "declined")
    setShowBanner(false)
    // Si el usuario rechaza las cookies, podemos deshabilitar Google Analytics
    disableGoogleAnalytics()
  }

  const disableGoogleAnalytics = () => {
    // Crear una propiedad para deshabilitar el seguimiento
    if (typeof window !== "undefined") {
      // @ts-ignore - Añadir propiedad para deshabilitar GA
      window["ga-disable-G-1FFHMB6H3P"] = true
    }
  }

  const closeBanner = () => {
    // Si el usuario cierra el banner sin tomar una decisión, asumimos que acepta
    localStorage.setItem("cookie-consent", "accepted")
    setShowBanner(false)
    initializeGoogleAnalytics()
  }

  if (!showBanner) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t shadow-lg">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 pr-8">
            <h3 className="text-lg font-semibold mb-1">Uso de cookies</h3>
            <p className="text-sm text-muted-foreground">
              Este sitio utiliza cookies para mejorar tu experiencia. Al continuar navegando, aceptas nuestro uso de
              cookies de acuerdo con nuestra{" "}
              <Link href="/politica-de-privacidad" className="text-purple-500 hover:underline">
                Política de Privacidad
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-2 md:mt-0">
            <Button variant="outline" onClick={declineCookies} className="sm:order-1">
              Rechazar
            </Button>
            <Button onClick={acceptCookies} className="bg-purple-600 hover:bg-purple-700 sm:order-2">
              Aceptar
            </Button>
          </div>
          <button
            onClick={closeBanner}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            aria-label="Cerrar banner de cookies"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
