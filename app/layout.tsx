import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SupabaseProvider } from "@/lib/supabase-provider"
import { AuthProvider } from "@/components/auth-provider"
import Header from "@/components/header"
import { Footer } from "@/components/footer"
import { CookieConsent } from "@/components/cookie-consent"
import { PendingCommentHandler } from "@/components/pending-comment-handler"
import { PendingSubmissionRedirect } from "@/components/pending-submission-redirect"
import { PendingVoteProcessor } from "@/components/pending-vote-processor"

import "./globals.css"
import { defaultMetadata, viewport as defaultViewport, themeColor } from "./metadata-config"

const inter = Inter({ subsets: ["latin"] })

// SEO --———————————————————————————————————
export const metadata: Metadata = defaultMetadata
export const viewport: Viewport = defaultViewport
export { themeColor }

// Root layout --———————————————————————————
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
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
          {/* Session-aware helpers */}
          <PendingSubmissionRedirect />
          <PendingVoteProcessor />
          <PendingCommentHandler />

          {/* Auth + Theme context */}
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="dark">
              {/* Shell */}
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
                <Footer />
              </div>

              {/* Global UI */}
              <CookieConsent />
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
