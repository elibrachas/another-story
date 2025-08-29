"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Added console logging for debugging theme provider
  React.useEffect(() => {
    console.log("ThemeProvider mounted")
  }, [])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
