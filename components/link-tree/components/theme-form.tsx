"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useThemeSettings } from "@/components/link-tree/hooks/use-theme-settings"
import { useToast } from "@/hooks/use-toast"
import type { Profile } from "@/components/link-tree/hooks/use-profile"
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

export function ThemeForm({ profile, onUpdateSecondaryBg, currentTheme, onThemeChange }: ThemeFormProps) {
  const { toast } = useToast()
  const [activeSubTab, setActiveSubTab] = useState("colors")
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const {
    themeSettings,
    updateColorTheme,
    updatePattern,
    updateFont,
    updateBorderRadius,
    toggleShadow,
    toggleGlassmorphism,
    resetToDefaults,
  } = useThemeSettings()

  // Initialize selected theme from settings
  useEffect(() => {
    setSelectedTheme(themeSettings.colorTheme)
  }, [themeSettings.colorTheme])

  const isDarkMode = currentTheme === "dark"

  const handleThemeSelection = (value: string) => {
    setSelectedTheme(value)
    updateColorTheme(value)
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
          <p className="text-sm text-muted-foreground">Customize the appearance of your page</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleResetDefaults} className="gap-1 bg-transparent">
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
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="colors">Colors</TabsTrigger>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
