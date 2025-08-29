"use client"

import { ThemeProvider } from "next-themes"
import { ThemeSettingsProvider } from "./hooks/use-theme-settings"
import { Toaster } from "@/components/ui/toaster"
import LinkTree from "./link-tree"

// Wrapper que encapsula el LinkTree para evitar conflictos con tu tema principal
export default function LinkTreeWrapper() {
  return (
    <div className="linktree-container">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        storageKey="linktree-theme" // Clave específica para evitar conflictos
      >
        <ThemeSettingsProvider>
          <LinkTree />
          <Toaster />
        </ThemeSettingsProvider>
      </ThemeProvider>
    </div>
  )
}
