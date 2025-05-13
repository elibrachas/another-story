import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CookieConsent } from "@/components/layout/cookie-consent"
import { OfflineBanner } from "@/components/layout/offline-banner"
import { SupabaseProvider } from "@/lib/supabase-provider"
import type { Metadata } from "next"
import { defaultMetadata } from "./metadata-config"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = defaultMetadata

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SupabaseProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <OfflineBanner />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
            <CookieConsent />
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
