"use client"

import type React from "react"

import { useState, useRef, type KeyboardEvent } from "react"
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
// Añadir el icono de información a las importaciones
import { AlertTriangle, X, Info } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import type { Tag } from "@/lib/types"

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

export function SubmitForm({ tags }: { tags: Tag[] }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [industry, setIndustry] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTags, setCustomTags] = useState<string[]>([])
  const [newTagInput, setNewTagInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const { session } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  const newTagInputRef = useRef<HTMLInputElement>(null)

  // Ordenar las etiquetas por popularidad (simulado - en un sistema real, esto vendría de la base de datos)
  const sortedTags = [...tags].sort((a, b) => (b.count || 0) - (a.count || 0))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      setShowLoginDialog(true)
      return
    }

    if (!title || !content || !industry) {
      toast({
        title: "Campos faltantes",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
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
        return
      }

      toast({
        title: "Historia enviada",
        description: "Tu historia ha sido enviada para revisión",
      })

      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al enviar tu historia",
        variant: "destructive",
      })
    } finally {
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

  return (
    <>
      <Alert variant="warning" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Protege tu privacidad</AlertTitle>
        <AlertDescription>
          Para proteger tu identidad, te recomendamos enviar tu historia de forma anónima y evitar incluir detalles que
          puedan identificarte a ti o a tu lugar de trabajo.
        </AlertDescription>
      </Alert>

      <Alert variant="info" className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Límite diario</AlertTitle>
        <AlertDescription>
          Los usuarios pueden publicar un máximo de 3 historias por día. Esta medida nos ayuda a mantener la calidad del
          contenido.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Dale a tu historia un título impactante"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industria</Label>
          <Select value={industry} onValueChange={setIndustry} required>
            <SelectTrigger>
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
          <Label htmlFor="content">Tu Historia</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Comparte tu experiencia..."
            className="min-h-[200px]"
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="anonymous"
            checked={isAnonymous}
            onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
          />
          <Label htmlFor="anonymous" className="font-normal">
            Enviar anónimamente (recomendado)
          </Label>
        </div>

        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar Historia"}
        </Button>
      </form>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </>
  )
}
