"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, Send, Loader2 } from "lucide-react"
import { submitStory } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { LoginDialog } from "./login-dialog"
import { useSupabase } from "@/lib/supabase-provider"
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

type SubmitFormProps = {
  tags?: Tag[]
}

export function SubmitForm({ tags: _availableTags = [] }: SubmitFormProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [industry, setIndustry] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const { toast } = useToast()
  const { session } = useSupabase()

  const addTag = () => {
    const trimmedTag = newTag.trim()
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      setShowLoginDialog(true)
      return
    }

    // Validaciones del cliente
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()
    const trimmedIndustry = industry.trim()

    if (!trimmedTitle) {
      toast({
        title: "Error",
        description: "El título es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (trimmedTitle.length < 5) {
      toast({
        title: "Error",
        description: "El título debe tener al menos 5 caracteres",
        variant: "destructive",
      })
      return
    }

    if (trimmedTitle.length > 200) {
      toast({
        title: "Error",
        description: "El título no puede exceder 200 caracteres",
        variant: "destructive",
      })
      return
    }

    if (!trimmedIndustry) {
      toast({
        title: "Error",
        description: "La industria es obligatoria",
        variant: "destructive",
      })
      return
    }

    if (!trimmedContent) {
      toast({
        title: "Error",
        description: "El contenido es obligatorio",
        variant: "destructive",
      })
      return
    }

    if (trimmedContent.length < 50) {
      toast({
        title: "Error",
        description: "La historia debe tener al menos 50 caracteres",
        variant: "destructive",
      })
      return
    }

    if (trimmedContent.length > 10000) {
      toast({
        title: "Error",
        description: "La historia no puede exceder 10,000 caracteres",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("title", trimmedTitle)
      formData.append("industry", trimmedIndustry)
      formData.append("content", trimmedContent)
      formData.append("tags", JSON.stringify(tags))

      const result = await submitStory(formData)

      if (result.success) {
        toast({
          title: "¡Historia enviada!",
          description: "Tu historia ha sido enviada y será revisada antes de ser publicada.",
        })

        // Limpiar el formulario
        setTitle("")
        setContent("")
        setTags([])
        setNewTag("")
      } else {
        toast({
          title: "Error",
          description: result.error || "Hubo un error al enviar tu historia. Inténtalo de nuevo.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al enviar historia:", error)
      toast({
        title: "Error",
        description: "Hubo un error inesperado. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Comparte tu Historia</CardTitle>
          <CardDescription>
            Cuéntanos tu experiencia laboral tóxica de forma anónima. Tu historia puede ayudar a otros.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Información sobre el proceso */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
              <strong>Proceso de revisión:</strong> Tu historia será revisada antes de ser publicada. Todas las
              historias son anónimas por defecto.
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Si prefieres puedes compartir tu historia por Telegram{" "}
              <a
                href="http://t.me/PippaStories_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 underline font-medium"
              >
                aquí
              </a>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título de tu historia *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Mi jefe me gritaba todos los días"
                maxLength={200}
                disabled={isSubmitting}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Mínimo 5 caracteres</span>
                <span>{title.length}/200</span>
              </div>
            </div>

            {/* Contenido */}
            <div className="space-y-2">
              <Label htmlFor="content">Tu historia *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Cuéntanos tu experiencia laboral tóxica. Sé específico sobre lo que pasó, cómo te afectó y qué aprendiste de la situación..."
                rows={8}
                maxLength={10000}
                disabled={isSubmitting}
                className="w-full resize-none"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Mínimo 50 caracteres</span>
                <span>{content.length}/10,000</span>
              </div>
            </div>

            {/* Industria */}
            <div className="space-y-2">
              <Label htmlFor="industry">Industria *</Label>
              <Select value={industry} onValueChange={setIndustry} disabled={isSubmitting}>
                <SelectTrigger id="industry" className="w-full">
                  <SelectValue placeholder="Selecciona una industria" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Etiquetas */}
            <div className="space-y-2">
              <Label htmlFor="tags">Etiquetas (opcional)</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ej: acoso, burnout, discriminación"
                  maxLength={30}
                  disabled={isSubmitting || tags.length >= 5}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addTag}
                  disabled={!newTag.trim() || tags.length >= 5 || isSubmitting}
                  variant="outline"
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      disabled={isSubmitting}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Máximo 5 etiquetas. Presiona Enter o el botón + para agregar.
              </p>
            </div>

            {/* Botón de envío */}
            <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Historia
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
    </div>
  )
}
