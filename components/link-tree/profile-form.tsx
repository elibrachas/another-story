"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useThemeSettings } from "@/hooks/use-theme-settings"
import { cn } from "@/lib/utils"
import type { Profile } from "@/hooks/use-profile"

interface ProfileFormProps {
  profile: Profile
  onProfileChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onToggleVerified: () => void
}

export function ProfileForm({ profile, onProfileChange, onToggleVerified }: ProfileFormProps) {
  const { themeSettings } = useThemeSettings()

  return (
    <div className={cn("space-y-4", themeSettings.font)}>
      <div className="space-y-2">
        <Label htmlFor="name">Display Name</Label>
        <Input id="name" name="name" value={profile.name} onChange={onProfileChange} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" rows={3} value={profile.bio} onChange={onProfileChange} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Avatar URL</Label>
        <Input
          id="avatarUrl"
          name="avatarUrl"
          value={profile.avatarUrl}
          onChange={onProfileChange}
          placeholder="https://example.com/avatar.jpg"
        />
      </div>
      <div className="flex items-center space-x-2 mt-2">
        <Label htmlFor="verified" className="cursor-pointer">
          Verified Profile
        </Label>
        <input
          type="checkbox"
          id="verified"
          checked={profile.verified}
          onChange={onToggleVerified}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
      </div>
    </div>
  )
}
