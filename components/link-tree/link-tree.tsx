"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useProfile } from "@/components/link-tree/hooks/use-profile"
import { useLinks } from "@/components/link-tree/hooks/use-links"
import { CardFlip } from "@/components/link-tree/ui/card-flip"
import { Header } from "@/components/link-tree/components/header"
import { ProfileView } from "@/components/link-tree/components/profile-view"
import { EditView } from "@/components/link-tree/components/edit-view"
import { useThemeSettings } from "@/components/link-tree/hooks/use-theme-settings"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

// Perfil actualizado para Crónicas Laborales
const defaultProfile = {
  name: "Eli Brachas",
  bio: "Desarrollador Full Stack y creador de Crónicas Laborales. Especializado en React, Node.js y tecnologías web modernas.",
  avatarUrl: "/images/eli-brachas-avatar.jpg",
  secondaryBg: "bg-secondary",
  verified: false,
}

// Enlaces actualizados con tu ecosistema
const defaultLinks = [
  {
    id: "1",
    title: "Crónicas Laborales",
    url: "https://cronicaslaborales.com",
  },
  {
    id: "2",
    title: "GitHub",
    url: "https://github.com/elibrachas",
  },
  {
    id: "3",
    title: "LinkedIn",
    url: "https://linkedin.com/in/elibrachas",
  },
  {
    id: "4",
    title: "Portfolio Personal",
    url: "https://elibrachas.dev",
  },
  {
    id: "5",
    title: "Twitter / X",
    url: "https://twitter.com/elibrachas",
  },
  {
    id: "6",
    title: "Email",
    url: "mailto:eli@cronicaslaborales.com",
  },
]

export default function LinkTree() {
  const { toast } = useToast()
  const [isEditMode, setIsEditMode] = useState(false)
  const { theme } = useTheme()

  // Use custom hooks for profile and links management
  const { profile, handleProfileChange, toggleVerified, updateSecondaryBg, saveProfileChanges } =
    useProfile(defaultProfile)

  const { links, newLink, addLink, deleteLink, updateLink, handleNewLinkChange } = useLinks(defaultLinks)

  const { themeSettings } = useThemeSettings()

  const toggleEditMode = () => {
    if (isEditMode) {
      saveProfileChanges()
      toast({
        title: "Cambios guardados",
        description: "Tu perfil ha sido actualizado",
      })
    }
    setIsEditMode(!isEditMode)
  }

  // Apply font family to the entire application when it changes
  useEffect(() => {
    // Apply the selected font to the root element
    document.documentElement.classList.remove("font-sans", "font-serif", "font-mono")
    document.documentElement.classList.add(themeSettings.font)
  }, [themeSettings.font, theme])

  return (
    <div className={cn("w-full max-w-3xl mx-auto", themeSettings.font)}>
      <Header isEditMode={isEditMode} onToggleEditMode={toggleEditMode} />

      <div className="w-full max-w-md mx-auto">
        <CardFlip
          isFlipped={isEditMode}
          onFlip={toggleEditMode}
          frontContent={<ProfileView profile={profile} links={links} />}
          backContent={
            <EditView
              profile={profile}
              links={links}
              newLink={newLink}
              onProfileChange={handleProfileChange}
              onToggleVerified={toggleVerified}
              onUpdateSecondaryBg={updateSecondaryBg}
              onNewLinkChange={handleNewLinkChange}
              onAddLink={addLink}
              onDeleteLink={deleteLink}
              onUpdateLink={updateLink}
            />
          }
        />
      </div>
    </div>
  )
}
