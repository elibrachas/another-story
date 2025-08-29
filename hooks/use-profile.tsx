"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export interface Profile {
  name: string
  bio: string
  avatarUrl: string
  secondaryBg: string
  verified: boolean
}

export function useProfile(initialProfile: Profile) {
  const { toast } = useToast()
  const [profile, setProfile] = useState<Profile>(initialProfile)

  // Handle profile field changes
  const updateProfile = (field: keyof Profile, value: string | boolean) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle form field changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    updateProfile(name as keyof Profile, value)
  }

  // Toggle verified status
  const toggleVerified = () => {
    updateProfile("verified", !profile.verified)
  }

  // Update secondary background
  const updateSecondaryBg = (bgColor: string) => {
    updateProfile("secondaryBg", bgColor)

    // Apply the background color to the main element
    document.querySelector("main")?.classList.remove(
      ...document
        .querySelector("main")
        ?.classList.value.split(" ")
        .filter((cls) => cls.startsWith("bg-")),
    )
    document.querySelector("main")?.classList.add(bgColor)
  }

  // Apply secondary background color when component mounts or when it changes
  useEffect(() => {
    if (profile.secondaryBg) {
      document.querySelector("main")?.classList.remove(
        ...document
          .querySelector("main")
          ?.classList.value.split(" ")
          .filter((cls) => cls.startsWith("bg-")),
      )
      document.querySelector("main")?.classList.add(profile.secondaryBg)
    }
  }, [profile.secondaryBg])

  // Save profile changes notification
  const saveProfileChanges = () => {
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    })
  }

  return {
    profile,
    updateProfile,
    handleProfileChange,
    toggleVerified,
    updateSecondaryBg,
    saveProfileChanges,
  }
}
