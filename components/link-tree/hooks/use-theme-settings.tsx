"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext, useCallback } from "react"
import { useTheme } from "next-themes"

// Define the theme settings type
export interface ThemeSettings {
  colorTheme: string
  gradient: string
  pattern: string
  font: string
  borderRadius: string
  effects: {
    shadow: boolean
    glassmorphism: boolean
    cardOpacity: number
    animationSpeed: number
  }
}

// Theme color mappings
export const themeColorMappings = {
  default: {
    primary: "0 0% 9%",
    secondary: "0 0% 96.1%",
    accent: "0 0% 96.1%",
  },
  rose: {
    primary: "347 77% 50%",
    secondary: "355 100% 97%",
    accent: "347 77% 92%",
  },
  green: {
    primary: "160 84% 39%",
    secondary: "150 100% 96%",
    accent: "160 84% 92%",
  },
  purple: {
    primary: "259 94% 51%",
    secondary: "270 100% 98%",
    accent: "259 94% 93%",
  },
  orange: {
    primary: "24 94% 53%",
    secondary: "30 100% 97%",
    accent: "24 94% 93%",
  },
  blue: {
    primary: "217 91% 60%",
    secondary: "213 100% 97%",
    accent: "217 91% 93%",
  },
  teal: {
    primary: "173 80% 40%",
    secondary: "180 100% 97%",
    accent: "173 80% 93%",
  },
  pink: {
    primary: "330 81% 60%",
    secondary: "327 100% 97%",
    accent: "330 81% 93%",
  },
}

// Default theme settings
const defaultThemeSettings: ThemeSettings = {
  colorTheme: "default",
  gradient: "none",
  pattern: "none",
  font: "font-sans",
  borderRadius: "rounded-lg",
  effects: {
    shadow: true,
    glassmorphism: false,
    cardOpacity: 1,
    animationSpeed: 100,
  },
}

// Create context
const ThemeSettingsContext = createContext<{
  themeSettings: ThemeSettings
  updateColorTheme: (value: string) => void
  updateGradient: (value: string) => void
  updatePattern: (value: string) => void
  updateFont: (value: string) => void
  updateBorderRadius: (value: string) => void
  updateCardOpacity: (value: number) => void
  updateAnimationSpeed: (value: number) => void
  toggleShadow: (value: boolean) => void
  toggleGlassmorphism: (value: boolean) => void
  resetToDefaults: () => void
  getThemeColors: (theme: string) => { primary: string; secondary: string; accent: string }
}>({
  themeSettings: defaultThemeSettings,
  updateColorTheme: () => {},
  updateGradient: () => {},
  updatePattern: () => {},
  updateFont: () => {},
  updateBorderRadius: () => {},
  updateCardOpacity: () => {},
  updateAnimationSpeed: () => {},
  toggleShadow: () => {},
  toggleGlassmorphism: () => {},
  resetToDefaults: () => {},
  getThemeColors: () => ({ primary: "", secondary: "", accent: "" }),
})

export function ThemeSettingsProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultThemeSettings)
  const [isInitialized, setIsInitialized] = useState(false)

  // Memoized function to get theme colors
  const getThemeColors = useCallback((themeName: string) => {
    return themeColorMappings[themeName as keyof typeof themeColorMappings] || themeColorMappings.default
  }, [])

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("linktree-theme-settings")
      if (savedSettings) {
        setThemeSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error("Failed to parse theme settings:", error)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // Apply theme settings when they change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("linktree-theme-settings", JSON.stringify(themeSettings))
    }
  }, [themeSettings, isInitialized])

  const updateColorTheme = useCallback((value: string) => {
    setThemeSettings((prev) => ({ ...prev, colorTheme: value }))
  }, [])

  const updateGradient = useCallback((value: string) => {
    setThemeSettings((prev) => ({ ...prev, gradient: value }))
  }, [])

  const updatePattern = useCallback((value: string) => {
    setThemeSettings((prev) => ({ ...prev, pattern: value }))
  }, [])

  const updateFont = useCallback((value: string) => {
    setThemeSettings((prev) => ({ ...prev, font: value }))
  }, [])

  const updateBorderRadius = useCallback((value: string) => {
    setThemeSettings((prev) => ({ ...prev, borderRadius: value }))
  }, [])

  const updateCardOpacity = useCallback((value: number) => {
    setThemeSettings((prev) => ({
      ...prev,
      effects: { ...prev.effects, cardOpacity: value },
    }))
  }, [])

  const updateAnimationSpeed = useCallback((value: number) => {
    setThemeSettings((prev) => ({
      ...prev,
      effects: { ...prev.effects, animationSpeed: value },
    }))
  }, [])

  const toggleShadow = useCallback((value: boolean) => {
    setThemeSettings((prev) => ({
      ...prev,
      effects: { ...prev.effects, shadow: value },
    }))
  }, [])

  const toggleGlassmorphism = useCallback((value: boolean) => {
    setThemeSettings((prev) => ({
      ...prev,
      effects: { ...prev.effects, glassmorphism: value },
    }))
  }, [])

  const resetToDefaults = useCallback(() => {
    setThemeSettings(defaultThemeSettings)
  }, [])

  return (
    <ThemeSettingsContext.Provider
      value={{
        themeSettings,
        updateColorTheme,
        updateGradient,
        updatePattern,
        updateFont,
        updateBorderRadius,
        updateCardOpacity,
        updateAnimationSpeed,
        toggleShadow,
        toggleGlassmorphism,
        resetToDefaults,
        getThemeColors,
      }}
    >
      {children}
    </ThemeSettingsContext.Provider>
  )
}

export function useThemeSettings() {
  return useContext(ThemeSettingsContext)
}
