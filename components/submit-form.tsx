"use client"

import type React from "react"
import { useState, useRef, type KeyboardEvent, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { LoginDialog } from "@/components/login-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { submitStory } from "@/lib/actions"
import { useSupabase } from "@/lib/supabase-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, X, CheckCircle2, MapPin } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { CountryFlag } from "@/components/country-flag"
import type { Tag } from "@/lib/types"
import {
  savePendingStory,
  getPendingStory,
  clearPendingStory,
  savePendingStoryEmail,
  setPendingSubmissionFlag,
  getPendingSubmissionFlag,
  clearPendingSubmissionFlag,
} from "@/lib/pending-story-service"

const industries = [
  "Tecnología",
  "Salud",
  "Finanzas",
  "Educación",
  "Comercio",
  "Hostelería",
  "Manufactura",
  "Gobierno",
  "Sin fines de lucro",
  "Otro",
]

const countries = [
  { code: "AR", name: "Argentina" },
  { code: "BO", name: "Bolivia" },
  { code: "BR", name: "Brasil" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
  { code: "CR", name: "Costa Rica" },
  { code: "CU", name: "Cuba" },
  { code: "DO", name: "República Dominicana" },
  { code: "EC", name: "Ecuador" },
  { code: "SV", name: "El Salvador" },
  { code: "ES", name: "España" },
  { code: "GT", name: "Guatemala" },
  { code: "HN", name: "Honduras" },
  { code: "MX", name: "México" },
  { code: "NI", name: "Nicaragua" },
  { code: "PA", name: "Panamá" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Perú" },
  { code: "PR", name: "Puerto Rico" },
  { code: "UY", name: "Uruguay" },
  { code: "VE", name: "Venezuela" },
  { code: "US", name: "Estados Unidos" },
  { code: "CA", name: "Canadá" },
]

export function SubmitForm({ tags }: { tags: Tag[] }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [industry, setIndustry] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false) // Cambiado a false por defecto
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTags, setCustomTags] = useState<string[]>([])
  const [newTagInput, setNewTagInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [userCountry, setUserCountry] = useState("XX")
  const [formErrors, setFormErrors] = useState<{
    title?: string
    content?: string
    industry?: string
  }>({})
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [pendingSubmission, setPendingSubmission] = useState(false)
  const [loginEmail, setLoginEmail] = useState("")
  const { session } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  const newTagInputRef = useRef<HTMLInputElement>(null)

  // Obtener el país del usuario desde la cookie
  useEffect(() => {
    const country =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("user-country="))
        ?.split("=")[1] || "XX"

    setUserCountry(country)
  }, [])

  // Cargar historia pendiente si existe
  useEffect(() => {
    if (session) {
      const pendingStory = getPendingStory()
      if (pendingStory) {
        const autoSubmit = getPendingSubmissionFlag()

        if (autoSubmit) {
          setTitle(pendingStory.title)
          setContent(pendingStory.content)
          setIndustry(pendingStory.industry)
          setIsAnonymous(pendingStory.isAnonymous)
          setSelectedTags(pendingStory.selectedTags)
          setCustomTags(pendingStory.customTags)

          // Marcar para envío automático
          setPendingSubmission(true)
        } else {
          // Preguntar al usuario si desea cargar la historia pendiente
          const confirmLoad = window.confirm("Encontramos una historia que estabas escribiendo. ¿Deseas cargarla?")

          if (confirmLoad) {
            setTitle(pendingStory.title)
            setContent(pendingStory.content)
            setIndustry(pendingStory.industry)
            setIsAnonymous(pendingStory.isAnonymous)
            setSelectedTags(pendingStory.selectedTags)
            setCustomTags(pendingStory.customTags)

            toast({
              title: "Historia cargada",
              description: "Se ha cargado tu historia pendiente",
            })
          }
        }

        // Limpiar la historia pendiente después de cargarla o si el usuario rechaza
        clearPendingStory()
      }
    }
  }, [session, toast])

  // Efecto para detectar cuando el usuario se autentica y tiene una presentación pendiente
  useEffect(() => {
    // Si el usuario acaba de autenticarse y hay una presentación pendiente, enviar automáticamente
    if (session && pendingSubmission) {
      console.log("Usuario autenticado con envío pendiente, procesando automáticamente...")
      handleSubmit(new Event("submit") as React.FormEvent)
      setPendingSubmission(false)
      clearPendingSubmissionFlag()
    }
  }, [session, pendingSubmission])

  // Escuchar eventos de autenticación exitosos desde otras pestañas
  useEffect(() => {
    const handleAuthEvent = (e: StorageEvent) => {
      if (e.key === "auth_success_event") {
        router.refresh()
      }
    }

    window.addEventListener("storage", handleAuthEvent)
    return () => window.removeEventListener("storage", handleAuthEvent)
  }, [router])

  // Ordenar las etiquetas por popularidad (simulado - en un sistema real, esto vendría de la base de datos)
  const sortedTags = [...tags].sort((a, b) => (b.count || 0) - (a.count || 0))

  // Efecto para redirigir después de un envío exitoso
  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        // Redirigir al dashboard en lugar de la página principal
        router.push("/dashboard")
      }, 2000) // Reducimos el tiempo a 2 segundos para una mejor experiencia
      return () => clearTimeout(timer)
    }
  }, [submitSuccess, router])

  const validateForm = () => {
    const errors: {
      title?: string
      content?: string
      industry?: string
    } = {}
    let isValid = true

    if (!title.trim()) {
      errors.title = "El título es obligatorio"
      isValid = false
    }

    if (!content.trim()) {
      errors.content = "El contenido de la historia es obligatorio"
      isValid = false
    }

    if (!industry) {
      errors.industry = "Debes seleccionar una industria"
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar el formulario primero, independientemente del estado de autenticación
    if (!validateForm()) {
      toast({
        title: "Campos faltantes",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    if (!session) {
      // Guardar la historia pendiente antes de mostrar el diálogo de inicio de sesión
      savePendingStory({
        title,
        content,
        industry,
        isAnonymous,
        selectedTags,
        customTags,
      })

      // Marcar que hay una presentación pendiente
      setPendingSubmission(true)
      setPendingSubmissionFlag(true)
      setShowLoginDialog(true)
      return
    }

    try {
      setIsSubmitting(true)

      const result = await submitStory({
        title,
        content,
        industry,
        isAnonymous,
        tags: selectedTags,
        customTags,
      })

      if (!result.success) {
        // Mostrar el mensaje de error específico si existe
        toast({
          title: "Error",
          description: result.error || "Error al enviar tu historia",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Limpiar cualquier historia pendiente después de un envío exitoso
      clearPendingStory()
      clearPendingSubmissionFlag()

      // Mostrar mensaje de éxito
      setSubmitSuccess(true)
      toast({
        title: "Historia enviada",
        description: "Tu historia ha sido enviada para revisión",
      })

      // No redirigimos inmediatamente, lo hacemos con el useEffect después de mostrar el mensaje de éxito
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al enviar tu historia",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const handleNewTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTagInput.trim()) {
      e.preventDefault()
      addNewTag()
    }
  }

  const addNewTag = () => {
    const tagName = newTagInput.trim()
    if (!tagName) return

    // Verificar si la etiqueta ya existe en las predefinidas
    const existingTag = tags.find((tag) => tag.name.toLowerCase() === tagName.toLowerCase())
    if (existingTag) {
      if (!selectedTags.includes(existingTag.id)) {
        toggleTag(existingTag.id)
      }
    } else if (
      !customTags.includes(tagName) &&
      !customTags.some((tag) => tag.toLowerCase() === tagName.toLowerCase())
    ) {
      // Verificar si ya tenemos demasiadas etiquetas
      if (selectedTags.length + customTags.length >= 5) {
        toast({
          title: "Máximo 5 etiquetas",
          description: "Por favor, selecciona un máximo de 5 etiquetas en total",
          variant: "destructive",
        })
        return
      }

      // Añadir como etiqueta personalizada
      setCustomTags((prev) => [...prev, tagName])
    }

    setNewTagInput("")
    newTagInputRef.current?.focus()
  }

  const removeCustomTag = (tagToRemove: string) => {
    setCustomTags((prev) => prev.filter((tag) => tag !== tagToRemove))
  }

  const getTotalTagsCount = () => selectedTags.length + customTags.length

  // Manejar el cierre del diálogo de inicio de sesión
  const handleLoginDialogClose = (success: boolean, email?: string) => {
    setShowLoginDialog(false)

    // Si se proporcionó un email, guardarlo junto con la historia pendiente
    if (email) {
      savePendingStoryEmail(email)
    }

    // Si el inicio de sesión no fue exitoso, mantener la historia pendiente
    // pero cancelar la presentación pendiente automática
    if (!success) {
      setPendingSubmission(false)
      clearPendingSubmissionFlag()
    }
    // Si fue exitoso, el useEffect se encargará de enviar el formulario
  }

  // Si el envío fue exitoso, mostrar mensaje de confirmación
  if (submitSuccess) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 p-8 rounded-lg text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">¡Historia enviada con éxito!</h2>
        <p className="mb-6">
          Tu historia ha sido enviada para revisión. Serás redirigido al panel de control donde podrás ver el estado de
          tu historia.
        </p>
        <Button onClick={() => router.push("/dashboard")} className="bg-green-600 hover:bg-green-700">
          Ir al panel de control
        </Button>
      </div>
    )
  }

  return (
    <>
      <Alert variant="warning" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Protege tu privacidad</AlertTitle>
        <AlertDescription>
          Para proteger tu identidad, te recomendamos evitar incluir detalles que puedan identificarte a ti o a tu lugar
          de trabajo.
        </AlertDescription>
      </Alert>

      {/* Nueva sección informativa con enlace a Telegram */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
          <strong>Proceso de publicación:</strong> Tu historia será revisada antes de ser publicada. Todas las historias
          son anónimas por defecto.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Si prefieres puedes compartir tu historia por Telegram{" "}
          <a
            href="http://t.me/PippaStories_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800 font-medium underline"
          >
            aquí
          </a>
        </p>
      </div>

      {/* Mostrar el país detectado */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center">
        <MapPin className="h-5 w-5 mr-2 text-purple-500" />
        <div>
          <p className="text-sm font-medium">Tu ubicación detectada:</p>
          <div className="flex items-center mt-1">
            <CountryFlag countryCode={userCountry} showName={true} className="text-base" />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="space-y-2">
          <Label htmlFor="title" className={formErrors.title ? "text-red-500" : ""}>
            Título {formErrors.title && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (e.target.value.trim()) {
                setFormErrors((prev) => ({ ...prev, title: undefined }))
              }
            }}
            placeholder="Dale a tu historia un título impactante"
            className={formErrors.title ? "border-red-500 focus-visible:ring-red-500" : ""}
            required
          />
          {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry" className={formErrors.industry ? "text-red-500" : ""}>
            Industria {formErrors.industry && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={industry}
            onValueChange={(value) => {
              setIndustry(value)
              if (value) {
                setFormErrors((prev) => ({ ...prev, industry: undefined }))
              }
            }}
            required
          >
            <SelectTrigger className={formErrors.industry ? "border-red-500 focus-visible:ring-red-500" : ""}>
              <SelectValue placeholder="Selecciona una industria" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((ind) => (
                <SelectItem key={ind} value={ind}>
                  {ind}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.industry && <p className="text-red-500 text-sm mt-1">{formErrors.industry}</p>}
        </div>

        <div className="space-y-2">
          <Label>Etiquetas populares (selecciona hasta {5 - customTags.length})</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {sortedTags.map((tag) => (
              <Badge
                key={tag.id}
                variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                className={`cursor-pointer ${
                  selectedTags.includes(tag.id)
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "hover:bg-purple-100 dark:hover:bg-purple-900"
                }`}
                onClick={() => {
                  if (selectedTags.includes(tag.id) || getTotalTagsCount() < 5) {
                    toggleTag(tag.id)
                  } else {
                    toast({
                      title: "Máximo 5 etiquetas",
                      description: "Por favor, selecciona un máximo de 5 etiquetas en total",
                      variant: "destructive",
                    })
                  }
                }}
              >
                {tag.name} {tag.count ? `(${tag.count})` : ""}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="newTag">Añadir etiquetas personalizadas (hasta {5 - selectedTags.length})</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="newTag"
              ref={newTagInputRef}
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={handleNewTagKeyDown}
              placeholder="Escribe una etiqueta y presiona Enter"
              disabled={getTotalTagsCount() >= 5}
            />
            <Button
              type="button"
              onClick={addNewTag}
              disabled={!newTagInput.trim() || getTotalTagsCount() >= 5}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Añadir
            </Button>
          </div>

          {customTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {customTags.map((tag) => (
                <Badge key={tag} variant="default" className="bg-purple-600 hover:bg-purple-700 pr-1.5">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeCustomTag(tag)}
                    className="ml-1 rounded-full hover:bg-purple-800 p-0.5"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Eliminar etiqueta</span>
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-1">{getTotalTagsCount()}/5 etiquetas seleccionadas</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content" className={formErrors.content ? "text-red-500" : ""}>
            Tu Historia {formErrors.content && <span className="text-red-500">*</span>}
          </Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              if (e.target.value.trim()) {
                setFormErrors((prev) => ({ ...prev, content: undefined }))
              }
            }}
            placeholder="Comparte tu experiencia..."
            className={`min-h-[200px] ${formErrors.content ? "border-red-500 focus-visible:ring-red-500" : ""}`}
            required
          />
          {formErrors.content && <p className="text-red-500 text-sm mt-1">{formErrors.content}</p>}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="anonymous"
            checked={isAnonymous}
            onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
          />
          <Label htmlFor="anonymous" className="font-normal">
            Enviar anónimamente
          </Label>
        </div>

        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 relative" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="opacity-0">Enviar Historia</span>
              <span className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
            </>
          ) : (
            "Enviar Historia"
          )}
        </Button>
      </form>

      <LoginDialog
        open={showLoginDialog}
        onOpenChange={(open) => {
          if (!open) handleLoginDialogClose(false)
        }}
        onLoginSuccess={(email) => handleLoginDialogClose(true, email)}
        onEmailChange={setLoginEmail}
      />
    </>
  )
}
