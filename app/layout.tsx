import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SupabaseProvider } from "@/lib/supabase-provider"
import Header from "@/components/header"
import { Footer } from "@/components/footer"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  description: "Experiencias reales sobre ambientes laborales tóxicos",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background`}>
        <SupabaseProvider>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 container mx-auto px-4 py-6">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
