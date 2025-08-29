"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LinksForm } from "@/components/link-tree/links-form"
import { ProfileForm } from "@/components/link-tree/profile-form"
import { ThemeForm } from "@/components/link-tree/theme-form"
import { useThemeSettings } from "@/hooks/use-theme-settings"
import { cn } from "@/lib/utils"
import type { Profile } from "@/hooks/use-profile"
import type { LinkItemProps } from "@/hooks/use-links"
import { useState } from "react"
import { useTheme } from "next-themes"

interface EditViewProps {
  profile: Profile
  links: LinkItemProps[]
  newLink: { title: string; url: string }
  onProfileChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onToggleVerified: () => void
  onUpdateSecondaryBg: (bgColor: string) => void
  onNewLinkChange: (field: "title" | "url", value: string) => void
  onAddLink: () => void
  onDeleteLink: (id: string) => void
  onUpdateLink: (link: LinkItemProps) => void
}

export function EditView({
  profile,
  links,
  newLink,
  onProfileChange,
  onToggleVerified,
  onUpdateSecondaryBg,
  onNewLinkChange,
  onAddLink,
  onDeleteLink,
  onUpdateLink,
}: EditViewProps) {
  const [activeTab, setActiveTab] = useState("links")
  const { themeSettings } = useThemeSettings()
  const { theme, setTheme } = useTheme()

  return (
    <Card
      className={cn(
        "shadow-lg border-2 bg-background",
        themeSettings.borderRadius,
        themeSettings.effects.shadow ? "shadow-lg" : "shadow-none",
        themeSettings.effects.glassmorphism && "glassmorphism",
      )}
      style={{ opacity: themeSettings.effects.cardOpacity }}
    >
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className={cn("w-full", themeSettings.font)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
          </TabsList>

          <TabsContent value="links" className="space-y-4">
            <LinksForm
              links={links}
              newLink={newLink}
              onNewLinkChange={onNewLinkChange}
              onAddLink={onAddLink}
              onDeleteLink={onDeleteLink}
              onUpdateLink={onUpdateLink}
            />
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <ProfileForm profile={profile} onProfileChange={onProfileChange} onToggleVerified={onToggleVerified} />
          </TabsContent>

          <TabsContent value="theme" className="space-y-4">
            <ThemeForm
              profile={profile}
              onUpdateSecondaryBg={onUpdateSecondaryBg}
              currentTheme={theme}
              onThemeChange={setTheme}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
