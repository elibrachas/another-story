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

// Theme color mappings - this helps ensure consistent color application
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

  // Memoized function to get theme colors - improves performance by avoiding recalculations
  const getThemeColors = useCallback((themeName: string) => {
    return themeColorMappings[themeName as keyof typeof themeColorMappings] || themeColorMappings.default
  }, [])

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("themeSettings")
      if (savedSettings) {
        setThemeSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error("Failed to parse theme settings:", error)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // Apply theme settings immediately when they change
  useEffect(() => {
    if (isInitialized) {
      // Save to localStorage
      localStorage.setItem("themeSettings", JSON.stringify(themeSettings))

      // Apply CSS variables based on theme settings
      applyThemeSettings(themeSettings, theme === "dark")
    }
  }, [themeSettings, theme, isInitialized])

  // Helper function to adjust colors for dark mode
  const adjustColorForDarkMode = (color: string): string => {
    // Check if the color is already in HSL format
    if (color.startsWith("hsl(")) {
      // Extract the HSL values
      const match = color.match(/hsl$$([^)]+)$$/)
      if (match && match[1]) {
        // Return just the values without duplicating the hsl prefix
        return match[1]
      }
    }
    return color
  }

  // Update the applyThemeSettings function to correctly set HSL values
  const applyThemeSettings = (settings: ThemeSettings, isDark: boolean) => {
    console.log("Applying theme settings:", settings, "isDark:", isDark)
    const root = document.documentElement

    // Apply theme colors
    const colors = getThemeColors(settings.colorTheme)

    // Apply colors to CSS variables for consistent use across components
    if (isDark) {
      // Adjust colors for dark mode - properly format HSL values
      root.style.setProperty("--primary", colors.primary)
      root.style.setProperty("--primary-foreground", "0 0% 98%")
      root.style.setProperty("--icon-text-color", "255, 255, 255") // White text for icons
      root.style.setProperty("--secondary", colors.secondary)
      root.style.setProperty("--secondary-foreground", "0 0% 98%")
      root.style.setProperty("--accent", colors.accent)
      root.style.setProperty("--accent-foreground", "0 0% 98%")
    } else {
      // Light mode colors
      root.style.setProperty("--primary", colors.primary)
      root.style.setProperty("--primary-foreground", "0 0% 98%")
      root.style.setProperty("--icon-text-color", "255, 255, 255") // White text for icons
      root.style.setProperty("--secondary", colors.secondary)
      root.style.setProperty("--secondary-foreground", "0 0% 9%")
      root.style.setProperty("--accent", colors.accent)
      root.style.setProperty("--accent-foreground", "0 0% 9%")
    }

    // Apply font family to the root element
    document.documentElement.classList.remove("font-sans", "font-serif", "font-mono")
    document.documentElement.classList.add(settings.font)
    console.log("Applied font class:", settings.font)

    // Apply background pattern to the main element
    const mainElement = document.querySelector("main")
    if (mainElement) {
      // Remove all pattern classes
      mainElement.classList.remove(
        "pattern-none",
        "pattern-dots",
        "pattern-grid",
        "pattern-stripes",
        "pattern-waves",
        "pattern-hexagons",
      )

      // Add the selected pattern class
      if (settings.pattern !== "none") {
        mainElement.classList.add(settings.pattern)
      }
    }

    // Apply animation speed
    root.style.setProperty("--animation-speed", `${settings.effects.animationSpeed}ms`)

    // Apply card opacity
    root.style.setProperty("--card-opacity", settings.effects.cardOpacity.toString())

    // Apply border radius to CSS variable for consistent use
    root.style.setProperty("--card-border-radius", getBorderRadiusValue(settings.borderRadius))
  }

  // Helper function to adjust colors for dark mode
  // const adjustColorForDarkMode = (color: string): string => {
  //   // This is a simple adjustment - in a real app you might want more sophisticated conversion
  //   return color.replace("hsl(", "hsl(").replace(")", ")")
  // }

  // Helper function to get the actual pixel value for border radius
  const getBorderRadiusValue = (borderRadiusClass: string): string => {
    switch (borderRadiusClass) {
      case "rounded-none":
        return "0px"
      case "rounded-sm":
        return "0.125rem"
      case "rounded":
        return "0.25rem"
      case "rounded-lg":
        return "0.5rem"
      default:
        return "0.5rem"
    }
  }

  // Optimized update functions with useCallback to prevent unnecessary re-renders
  const updateColorTheme = useCallback(
    (value: string) => {
      setThemeSettings((prev) => ({ ...prev, colorTheme: value }))

      // Apply theme colors immediately for responsive feedback
      const colors = getThemeColors(value)
      const root = document.documentElement
      const isDark = theme === "dark"

      // Apply colors directly without adjustment
      root.style.setProperty("--primary", colors.primary)
      root.style.setProperty("--secondary", colors.secondary)
      root.style.setProperty("--accent", colors.accent)
    },
    [theme, getThemeColors],
  )

  const updateGradient = useCallback((value: string) => {
    setThemeSettings((prev) => ({ ...prev, gradient: value }))
  }, [])

  const updatePattern = useCallback((value: string) => {
    console.log("Updating pattern:", value)
    setThemeSettings((prev) => ({ ...prev, pattern: value }))

    // Apply pattern immediately for responsive feedback
    const mainElement = document.querySelector("main")
    if (mainElement) {
      // Remove all pattern classes
      mainElement.classList.remove(
        "pattern-none",
        "pattern-dots",
        "pattern-grid",
        "pattern-stripes",
        "pattern-waves",
        "pattern-hexagons",
      )

      // Add the selected pattern class
      if (value !== "none") {
        mainElement.classList.add(value)
      }
    }
  }, [])

  const updateFont = useCallback((value: string) => {
    setThemeSettings((prev) => ({ ...prev, font: value }))

    // Apply font immediately for responsive feedback
    document.documentElement.classList.remove("font-sans", "font-serif", "font-mono")
    document.documentElement.classList.add(value)
  }, [])

  const updateBorderRadius = useCallback((value: string) => {
    setThemeSettings((prev) => ({ ...prev, borderRadius: value }))

    // Apply border radius immediately for responsive feedback
    document.documentElement.style.setProperty("--card-border-radius", getBorderRadiusValue(value))
  }, [])

  const updateCardOpacity = useCallback((value: number) => {
    setThemeSettings((prev) => ({
      ...prev,
      effects: {
        ...prev.effects,
        cardOpacity: value,
      },
    }))

    // Apply opacity immediately for responsive feedback
    document.documentElement.style.setProperty("--card-opacity", value.toString())
  }, [])

  const updateAnimationSpeed = useCallback((value: number) => {
    setThemeSettings((prev) => ({
      ...prev,
      effects: {
        ...prev.effects,
        animationSpeed: value,
      },
    }))

    // Apply animation speed immediately for responsive feedback
    document.documentElement.style.setProperty("--animation-speed", `${value}ms`)
  }, [])

  const toggleShadow = useCallback((value: boolean) => {
    setThemeSettings((prev) => ({
      ...prev,
      effects: {
        ...prev.effects,
        shadow: value,
      },
    }))
  }, [])

  const toggleGlassmorphism = useCallback((value: boolean) => {
    setThemeSettings((prev) => ({
      ...prev,
      effects: {
        ...prev.effects,
        glassmorphism: value,
      },
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
