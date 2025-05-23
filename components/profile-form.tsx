"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { updateProfile } from "@/lib/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw } from "lucide-react"
import type { Profile } from "@/lib/types"
import { useSupabase } from "@/lib/supabase-provider"

export function ProfileForm({ profile }: { profile: Profile }) {
  const [displayName, setDisplayName] = useState(profile.display_name || "")
  const [bio, setBio] = useState(profile.bio || "")
  const [website, setWebsite] = useState(profile.website || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [displayNameError, setDisplayNameError] = useState<string | null>(null)
  const { supabase } = useSupabase()
  const { toast } = useToast()

  // Verificar si el usuario es administrador
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdminStatus = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user?.id) {
        const { data } = await supabase.from("profiles").select("admin").eq("id", session.user.id).single()

        setIsAdmin(!!data?.admin)
      }
    }

    checkAdminStatus()
  }, [supabase])

  const validateDisplayName = (name: string) => {
    if (!name) return null // Nombre vacío es válido

    // Si no es admin, verificar que no use variaciones de "admin"
    if (!isAdmin) {
      const adminRegex = /admin/i
      if (adminRegex.test(name)) {
        return "Solo los administradores pueden usar variaciones de 'admin' en su nombre visible"
      }
    }

    return null
  }

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setDisplayName(newName)
    setDisplayNameError(validateDisplayName(newName))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar el nombre visible antes de enviar
    const error = validateDisplayName(displayName)
    if (error) {
      setDisplayNameError(error)
      return
    }

    try {
      setIsLoading(true)

      await updateProfile({
        displayName,
        bio,
        website,
      })

      toast({
        title: "Perfil actualizado",
        description: "Tu información de perfil ha sido actualizada correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerateUsername = async () => {
    try {
      setIsRegenerating(true)

      await updateProfile({
        regenerateUsername: true,
      })

      toast({
        title: "Nombre de usuario regenerado",
        description: "Tu nombre de usuario ha sido actualizado correctamente",
      })

      // Recargar la página para mostrar el nuevo nombre de usuario
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo regenerar el nombre de usuario",
        variant: "destructive",
      })
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Alert variant="warning">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Protege tu privacidad</AlertTitle>
        <AlertDescription>
          Para proteger tu identidad, te hemos asignado un nombre de usuario anónimo. No uses tu nombre real al
          compartir historias o comentarios.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between p-4 border rounded-md">
        <div>
          <Label className="text-sm text-muted-foreground">Tu nombre de usuario anónimo</Label>
          <p className="font-medium">{profile.username || "Cargando..."}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRegenerateUsername} disabled={isRegenerating}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {isRegenerating ? "Regenerando..." : "Regenerar"}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="displayName">Nombre visible (opcional)</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={handleDisplayNameChange}
            placeholder="Cómo quieres que te vean los demás"
            className={displayNameError ? "border-red-500" : ""}
          />
          {displayNameError && <p className="text-sm text-red-500 mt-1">{displayNameError}</p>}
          <p className="text-xs text-muted-foreground">
            Este nombre se mostrará en tus historias y comentarios si lo configuras.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Biografía (opcional)</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Cuéntanos un poco sobre ti"
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Sitio web (opcional)</Label>
          <Input
            id="website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://tu-sitio-web.com"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700"
          disabled={isLoading || !!displayNameError}
        >
          {isLoading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>
    </div>
  )
}
