import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SupabaseProvider } from "@/lib/supabase-provider"
import { AuthProvider } from "@/components/auth-provider" // Asegurarnos de que se importa
import Header from "@/components/header"
import { Footer } from "@/components/footer"
import "./globals.css"
import { CookieConsent } from "@/components/cookie-consent"
import { PendingVoteProcessor } from "@/components/pending-vote-processor"
import Script from "next/script"
// Importar viewport y themeColor desde metadata-config
import { defaultMetadata, viewport, themeColor } from "./metadata-config"

const inter = Inter({ subsets: ["latin"] })

// Añadir la exportación de viewport y themeColor después de la exportación de metadata
export const metadata: Metadata = defaultMetadata
export { viewport, themeColor }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Google Analytics - Carga optimizada con Next.js Script */}
        <Script strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-1FFHMB6H3P" />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-1FFHMB6H3P');
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-background`}>
        <SupabaseProvider>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="dark">
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
                <Footer />
              </div>
              <CookieConsent />
              <PendingVoteProcessor />
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
