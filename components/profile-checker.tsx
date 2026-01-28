"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/lib/supabase-provider"
import { createInitialProfile } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function ProfileChecker() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [needsProfile, setNeedsProfile] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    const checkProfile = async () => {
      try {
        setIsChecking(true)

        // Verificar si el usuario está autenticado
        const { data: sessionData } = await supabase.auth.getSession()

        if (!sessionData.session) {
          // No hay sesión, no es necesario verificar el perfil
          setIsChecking(false)
          return
        }

        // Verificar si el usuario tiene un perfil
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", sessionData.session.user.id)
          .single()

        if (error && error.code === "PGRST116") {
          // No se encontró un perfil
          console.log("No se encontró un perfil para el usuario")
          setNeedsProfile(true)
        } else if (error) {
          // Otro tipo de error
          console.error("Error al verificar el perfil:", error)
          toast({
            title: "Error",
            description: "No se pudo verificar tu perfil",
            variant: "destructive",
          })
        } else {
          // Se encontró un perfil
          console.log("Perfil encontrado:", profileData)
          setNeedsProfile(false)
        }
      } catch (error) {
        console.error("Error al verificar el perfil:", error)
      } finally {
        setIsChecking(false)
      }
    }

    checkProfile()
  }, [supabase, toast])

  const handleCreateProfile = async () => {
    try {
      setIsCreating(true)
      const result = await createInitialProfile()

      if (result.success) {
        toast({
          title: "Perfil creado",
          description: "Tu perfil ha sido creado exitosamente",
        })
        setNeedsProfile(false)
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo crear tu perfil",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al crear el perfil:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error al crear tu perfil",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  if (isChecking) {
    return null // No mostrar nada mientras se verifica
  }

  if (!needsProfile) {
    return null // No mostrar nada si el usuario ya tiene un perfil
  }

  return (
    <Alert className="mb-4">
      <AlertTitle>Se requiere configuración de perfil</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>Necesitamos crear un perfil anónimo para que puedas interactuar con la plataforma.</p>
        <Button onClick={handleCreateProfile} disabled={isCreating} className="w-full mt-2">
          {isCreating ? "Creando perfil..." : "Crear mi perfil anónimo"}
        </Button>
      </AlertDescription>
    </Alert>
  )
}
