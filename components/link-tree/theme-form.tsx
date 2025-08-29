"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useThemeSettings, themeColorMappings } from "@/hooks/use-theme-settings"
import { useToast } from "@/hooks/use-toast"
import type { Profile } from "@/hooks/use-profile"
import { Moon, Sun } from "lucide-react"

interface ThemeFormProps {
  profile: Profile
  onUpdateSecondaryBg: (bgColor: string) => void
  currentTheme?: string
  onThemeChange: (theme: string) => void
}

// Color themes configuration
const colorThemes = [
  {
    name: "Default",
    value: "default",
    primaryColor: "#000000",
    secondaryColor: "#f1f5f9",
  },
  {
    name: "Rose",
    value: "rose",
    primaryColor: "#e11d48",
    secondaryColor: "#fff1f2",
  },
  {
    name: "Green",
    value: "green",
    primaryColor: "#10b981",
    secondaryColor: "#ecfdf5",
  },
  {
    name: "Purple",
    value: "purple",
    primaryColor: "#8b5cf6",
    secondaryColor: "#f5f3ff",
  },
  {
    name: "Orange",
    value: "orange",
    primaryColor: "#f97316",
    secondaryColor: "#fff7ed",
  },
  {
    name: "Blue",
    value: "blue",
    primaryColor: "#3b82f6",
    secondaryColor: "#eff6ff",
  },
  {
    name: "Teal",
    value: "teal",
    primaryColor: "#14b8a6",
    secondaryColor: "#f0fdfa",
  },
  {
    name: "Pink",
    value: "pink",
    primaryColor: "#ec4899",
    secondaryColor: "#fdf2f8",
  },
]

// Background color options
const backgroundColors = [
  { name: "Default", value: "bg-secondary" },
  { name: "Slate", value: "bg-slate-100" },
  { name: "Pink", value: "bg-pink-50" },
  { name: "Green", value: "bg-green-50" },
  { name: "Purple", value: "bg-purple-50" },
  { name: "Orange", value: "bg-orange-50" },
  { name: "Blue", value: "bg-blue-50" },
  { name: "Yellow", value: "bg-yellow-50" },
]

// Background pattern options
const backgroundPatterns = [
  { name: "None", value: "pattern-none", description: "No background pattern" },
  { name: "Dots", value: "pattern-dots", description: "Subtle dotted pattern" },
  { name: "Grid", value: "pattern-grid", description: "Clean grid lines" },
  { name: "Stripes", value: "pattern-stripes", description: "Diagonal striped pattern" },
  { name: "Waves", value: "pattern-waves", description: "Subtle wave-like grid" },
  { name: "Hexagons", value: "pattern-hexagons", description: "Complex hexagonal pattern" },
]

// Font options with display names and descriptions
const fontOptions = [
  {
    name: "Sans",
    value: "font-sans",
    description: "Clean, modern sans-serif font (Inter)",
    sample: "The quick brown fox jumps over the lazy dog.",
  },
  {
    name: "Serif",
    value: "font-serif",
    description: "Elegant serif font with classic appeal (Merriweather)",
    sample: "The quick brown fox jumps over the lazy dog.",
  },
  {
    name: "Mono",
    value: "font-mono",
    description: "Monospaced font for code and technical content (JetBrains Mono)",
    sample: "The quick brown fox jumps over the lazy dog.",
  },
]

export function ThemeForm({ profile, onUpdateSecondaryBg, currentTheme, onThemeChange }: ThemeFormProps) {
  const { toast } = useToast()
  const [activeSubTab, setActiveSubTab] = useState("colors")
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null)
  const {
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
  } = useThemeSettings()

  // Initialize selected theme from settings
  useEffect(() => {
    setSelectedTheme(themeSettings.colorTheme)
    setSelectedPattern(themeSettings.pattern)
  }, [themeSettings.colorTheme, themeSettings.pattern])

  const isDarkMode = currentTheme === "dark"

  // Optimized theme selection handler for immediate feedback
  const handleThemeSelection = (value: string) => {
    // Set local state immediately for UI feedback
    setSelectedTheme(value)
    // Update the actual theme setting
    updateColorTheme(value)
  }

  // Pattern selection handler with immediate feedback
  const handlePatternSelection = (value: string) => {
    // Set local state immediately for UI feedback
    setSelectedPattern(value)
    // Update the actual pattern setting
    updatePattern(value)
  }

  const handleDarkModeToggle = () => {
    const newTheme = isDarkMode ? "light" : "dark"
    onThemeChange(newTheme)
    toast({
      title: `${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`,
      description: `Switched to ${newTheme} mode`,
    })
  }

  const handleResetDefaults = () => {
    resetToDefaults()
    setSelectedTheme("default")
    setSelectedPattern("none")
    toast({
      title: "Theme reset",
      description: "Theme settings have been reset to defaults",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Theme Settings</h3>
          <p className="text-sm text-muted-foreground">Customize the appearance of your v0.me page</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleResetDefaults} className="gap-1">
          Reset Defaults
        </Button>
      </div>

      {/* Dark Mode Toggle */}
      <div className="flex items-center justify-between p-3 border rounded-md">
        <div className="flex items-center gap-2">
          {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          <div>
            <Label htmlFor="dark-mode" className="text-base">
              Dark Mode
            </Label>
            <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
          </div>
        </div>
        <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={handleDarkModeToggle} />
      </div>

      {/* Theme Settings Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="background">Background</TabsTrigger>
          <TabsTrigger value="effects">Effects</TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-4">
          <div className="space-y-2">
            <Label>Color Theme</Label>
            <RadioGroup
              value={selectedTheme || themeSettings.colorTheme}
              onValueChange={handleThemeSelection}
              className="grid grid-cols-4 gap-2"
            >
              {colorThemes.map((colorTheme) => (
                <div key={colorTheme.value}>
                  <RadioGroupItem value={colorTheme.value} id={`theme-${colorTheme.value}`} className="sr-only" />
                  <Label
                    htmlFor={`theme-${colorTheme.value}`}
                    className={cn(
                      "flex flex-col items-center justify-between rounded-md border-2 border-muted p-2 hover:border-accent transition-all duration-150",
                      (selectedTheme || themeSettings.colorTheme) === colorTheme.value &&
                        "border-primary ring-2 ring-primary/20",
                    )}
                  >
                    <div className="flex gap-1 mb-2">
                      <div className="w-4 h-8 rounded-l-full" style={{ backgroundColor: colorTheme.primaryColor }} />
                      <div className="w-4 h-8 rounded-r-full" style={{ backgroundColor: colorTheme.secondaryColor }} />
                    </div>
                    <span className="text-xs font-medium">{colorTheme.name}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Theme Preview */}
            {selectedTheme && (
              <div className="mt-4 p-3 border rounded-md">
                <h4 className="text-sm font-medium mb-2">Theme Preview</h4>
                <div className="flex gap-2 items-center">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{
                      backgroundColor: `hsl(${themeColorMappings[selectedTheme as keyof typeof themeColorMappings]?.primary || "0 0% 0%"})`,
                    }}
                  />
                  <span className="text-xs">Primary</span>
                </div>
                <div className="flex gap-2 items-center mt-1">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{
                      backgroundColor: `hsl(${themeColorMappings[selectedTheme as keyof typeof themeColorMappings]?.secondary || "0 0% 96.1%"})`,
                    }}
                  />
                  <span className="text-xs">Secondary</span>
                </div>
                <div className="flex gap-2 items-center mt-1">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{
                      backgroundColor: `hsl(${themeColorMappings[selectedTheme as keyof typeof themeColorMappings]?.accent || "0 0% 96.1%"})`,
                    }}
                  />
                  <span className="text-xs">Accent</span>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Background Tab */}
        <TabsContent value="background" className="space-y-4">
          <div className="space-y-2">
            <Label>Page Background Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {backgroundColors.map((bgColor) => (
                <button
                  key={bgColor.value}
                  type="button"
                  className={cn(
                    "h-12 rounded-md border-2 border-muted hover:border-accent flex items-center justify-center transition-all duration-150",
                    bgColor.value,
                    profile.secondaryBg === bgColor.value && "border-primary ring-2 ring-primary/20",
                  )}
                  onClick={() => onUpdateSecondaryBg(bgColor.value)}
                  aria-label={`Set background to ${bgColor.name}`}
                >
                  <span className="text-xs font-medium">{bgColor.name}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Choose a background color for your page</p>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <Label>Background Pattern</Label>
            <RadioGroup
              value={selectedPattern || themeSettings.pattern}
              onValueChange={handlePatternSelection}
              className="grid grid-cols-2 gap-2"
            >
              {backgroundPatterns.map((pattern) => (
                <div key={pattern.value}>
                  <RadioGroupItem value={pattern.value} id={`pattern-${pattern.value}`} className="sr-only" />
                  <Label
                    htmlFor={`pattern-${pattern.value}`}
                    className={cn(
                      "flex flex-col rounded-md border-2 border-muted hover:border-accent transition-all duration-150 overflow-hidden",
                      (selectedPattern || themeSettings.pattern) === pattern.value &&
                        "border-primary ring-2 ring-primary/20",
                    )}
                  >
                    <div
                      className={cn(
                        "h-24 w-full flex items-center justify-center",
                        pattern.value,
                        isDarkMode ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-800",
                      )}
                    >
                      {pattern.value === "pattern-none" && (
                        <span className="text-sm text-muted-foreground">No pattern</span>
                      )}
                    </div>
                    <div className="p-2">
                      <span className="text-xs font-medium">{pattern.name}</span>
                      <p className="text-xs text-muted-foreground mt-1">{pattern.description}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label htmlFor="glassmorphism">Glassmorphism Effect</Label>
              <Switch
                id="glassmorphism"
                checked={themeSettings.effects.glassmorphism}
                onCheckedChange={toggleGlassmorphism}
              />
            </div>
            <p className="text-xs text-muted-foreground">Add a frosted glass effect to cards</p>
          </div>
        </TabsContent>

        {/* Effects Tab */}
        <TabsContent value="effects" className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="card-shadow">Card Shadow</Label>
              <Switch id="card-shadow" checked={themeSettings.effects.shadow} onCheckedChange={toggleShadow} />
            </div>
            <p className="text-xs text-muted-foreground">Add shadows to cards for depth</p>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <Label htmlFor="border-radius">Border Radius</Label>
            <RadioGroup
              value={themeSettings.borderRadius}
              onValueChange={updateBorderRadius}
              className="grid grid-cols-2 gap-2"
            >
              {[
                { name: "None", value: "rounded-none" },
                { name: "Small", value: "rounded-sm" },
                { name: "Medium", value: "rounded" },
                { name: "Large", value: "rounded-lg" },
              ].map((option) => (
                <div key={option.value}>
                  <RadioGroupItem value={option.value} id={`radius-${option.value}`} className="sr-only" />
                  <Label
                    htmlFor={`radius-${option.value}`}
                    className={cn(
                      "flex h-12 items-center justify-center rounded-md border-2 border-muted hover:border-accent transition-all duration-150",
                      option.value,
                      themeSettings.borderRadius === option.value && "border-primary ring-2 ring-primary/20",
                    )}
                  >
                    <span className="text-xs font-medium">{option.name}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2 pt-4 border-t">
            <Label>Font Family</Label>
            <RadioGroup value={themeSettings.font} onValueChange={updateFont} className="grid grid-cols-1 gap-2">
              {fontOptions.map((font) => (
                <div key={font.value}>
                  <RadioGroupItem value={font.value} id={`font-${font.value}`} className="sr-only" />
                  <Label
                    htmlFor={`font-${font.value}`}
                    className={cn(
                      "flex flex-col p-3 rounded-md border-2 border-muted hover:border-accent transition-all duration-150",
                      themeSettings.font === font.value && "border-primary ring-2 ring-primary/20",
                    )}
                  >
                    <div className={cn("font-preview", font.value)}>
                      <h4 className="font-preview-title font-medium">{font.name}</h4>
                      <p className="font-preview-text">{font.sample}</p>
                      <p className="font-preview-info">{font.description}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
