"use client"
import { cn } from "@/lib/utils"
import type React from "react"

import { useTheme } from "next-themes"
import { useThemeSettings } from "@/hooks/use-theme-settings"
import { getLinkIcon } from "@/components/link-item/utils"
import { useMemo } from "react"

interface ViewModeProps {
  title: string
  url: string
}

export function ViewMode({ title, url }: ViewModeProps) {
  const { theme } = useTheme()
  const { themeSettings, getThemeColors } = useThemeSettings()
  const isDarkTheme = theme === "dark"

  // Memoize theme colors to prevent unnecessary recalculations
  const themeColors = useMemo(() => {
    return getThemeColors(themeSettings.colorTheme)
  }, [themeSettings.colorTheme, getThemeColors])

  // Helper function to convert HSL values to RGB
  function hslToRgb(h: number, s: number, l: number) {
    s /= 100
    l /= 100

    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
    const m = l - c / 2

    let r = 0,
      g = 0,
      b = 0

    if (0 <= h && h < 60) {
      r = c
      g = x
      b = 0
    } else if (60 <= h && h < 120) {
      r = x
      g = c
      b = 0
    } else if (120 <= h && h < 180) {
      r = 0
      g = c
      b = x
    } else if (180 <= h && h < 240) {
      r = 0
      g = x
      b = c
    } else if (240 <= h && h < 300) {
      r = x
      g = 0
      b = c
    } else if (300 <= h && h < 360) {
      r = c
      g = 0
      b = x
    }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
    }
  }

  // Update the dynamicStyles useMemo to handle the new HSL format
  const dynamicStyles = useMemo(() => {
    const primaryColor = themeColors.primary
    let primaryColorRgb

    // Check if the color is in HSL format (space-separated values)
    if (primaryColor.includes(" ")) {
      const [h, s, l] = primaryColor.split(" ").map(Number)
      primaryColorRgb = hslToRgb(h, s, l)
    } else if (primaryColor.startsWith("#")) {
      primaryColorRgb = hexToRgb(primaryColor)
    } else {
      // Default fallback
      primaryColorRgb = { r: 0, g: 0, b: 0 }
    }

    return {
      hoverBg: isDarkTheme
        ? `rgba(${primaryColorRgb?.r || 0}, ${primaryColorRgb?.g || 0}, ${primaryColorRgb?.b || 0}, 0.1)`
        : `rgba(${primaryColorRgb?.r || 0}, ${primaryColorRgb?.g || 0}, ${primaryColorRgb?.b || 0}, 0.05)`,
      iconBg: `hsl(${primaryColor})`,
      gradientFrom: `rgba(${primaryColorRgb?.r || 0}, ${primaryColorRgb?.g || 0}, ${primaryColorRgb?.b || 0}, 0.05)`,
      transitionDuration: `${themeSettings.effects.animationSpeed}ms`,
      opacity: themeSettings.effects.cardOpacity,
    }
  }, [themeColors, isDarkTheme, themeSettings.effects])

  return (
    <div
      className={cn(
        "link-item-container relative overflow-hidden group",
        "transition-all ease-in-out",
        "border shadow-sm",
        "hover:shadow-md hover:border-primary/30",
        "active:scale-[0.98] active:shadow-inner",
        themeSettings.borderRadius,
        themeSettings.effects.glassmorphism && "glassmorphism",
      )}
      style={
        {
          transitionDuration: dynamicStyles.transitionDuration,
          opacity: dynamicStyles.opacity,
          "--hover-bg": dynamicStyles.hoverBg,
        } as React.CSSProperties
      }
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(to right, ${dynamicStyles.gradientFrom}, transparent)`,
          transitionDuration: dynamicStyles.transitionDuration,
        }}
      ></div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center gap-3 p-3 w-full",
          "text-foreground hover:text-primary transition-colors",
          "font-medium",
          themeSettings.font,
        )}
        style={{
          transitionDuration: dynamicStyles.transitionDuration,
        }}
      >
        <div
          className={cn(
            "flex items-center justify-center",
            "w-8 h-8 rounded-full",
            "text-white", // Always use white text for better contrast
            "transition-all",
            "group-hover:scale-110 group-hover:shadow-sm",
          )}
          style={{
            backgroundColor: dynamicStyles.iconBg,
            transitionDuration: dynamicStyles.transitionDuration,
          }}
        >
          {getLinkIcon(url)}
        </div>
        <span className="flex-1">{title}</span>
      </a>
    </div>
  )
}

// Helper function to convert hex to rgb
function hexToRgb(hex: string) {
  // Remove the # if present
  hex = hex.replace("#", "")

  // Parse the hex values
  const r = Number.parseInt(hex.substring(0, 2), 16)
  const g = Number.parseInt(hex.substring(2, 4), 16)
  const b = Number.parseInt(hex.substring(4, 6), 16)

  // Check if the parsing was successful
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return null
  }

  return { r, g, b }
}

// Helper function to convert HSL to hex
function hslToHex(hsl: string) {
  // This is a simplified conversion - in a real app you'd want a more robust conversion
  // Extract values from hsl string
  const match = hsl.match(/hsl$$(\d+),\s*(\d+)%,\s*(\d+)%$$/)
  if (!match) return "#000000"

  const h = Number.parseInt(match[1]) / 360
  const s = Number.parseInt(match[2]) / 100
  const l = Number.parseInt(match[3]) / 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}
