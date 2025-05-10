"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Wand2, Save, X, ArrowLeft, Check } from "lucide-react"
import { updateStory, improveStoryWithAI } from "@/lib/actions"
import type { Story, Tag } from "@/lib/types"

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

type EditStoryFormProps = {
  story: Story
  allTags: Tag[]
}

export function EditStoryForm({ story, allTags }: EditStoryFormProps) {
  const [title, setTitle] = useState(story.title)
  const [content, setContent] = useState(story.content)
  const [improvedContent, setImprovedContent] = useState("")
  const [industry, setIndustry] = useState(story.industry)
  const [selectedTags, setSelectedTags] = useState<string[]>(story.tags?.map((tag) => tag.id) || [])
  const [newTagInput, setNewTagInput] = useState("")
  const [customTags, setCustomTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isImproving, setIsImproving] = useState(false)
  const [publishAfterSave, setPublishAfterSave] = useState(false)
  const [activeTab, setActiveTab] = useState("original")
  const router = useRouter()
  const { toast } = useToast()
  const newTagInputRef = useRef<HTMLInputElement>(null)

  // Ordenar las etiquetas por nombre
  const sortedTags = [...allTags].sort((a, b) => a.name.localeCompare(b.name))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !(activeTab === "improved" ? improvedContent : content) || !industry) {
      toast({
        title: "Campos faltantes",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const finalContent = activeTab === "improved" ? improvedContent : content

      await updateStory({
        id: story.id,
        title,
        content: finalContent,
        industry,
        tags: selectedTags,
        customTags,
        publish: publishAfterSave,
      })

      toast({
        title: "Historia actualizada",
        description: publishAfterSave
          ? "La historia ha sido actualizada y publicada"
          : "La historia ha sido actualizada",
      })

      router.push("/admin")
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar la historia",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImproveWithAI = async () => {
    try {
      setIsImproving(true)

      console.log("Iniciando mejora de contenido con IA...")
      const result = await improveStoryWithAI(content)

      if (!result.success) {
        console.error("Error al mejorar contenido:", result.error)
        throw new Error(result.error || "Error al mejorar la historia con IA")
      }

      console.log("Contenido mejorado recibido correctamente")
      setImprovedContent(result.improvedContent || "")
      setActiveTab("improved")

      toast({
        title: "Contenido mejorado",
        description: "El contenido ha sido mejorado con IA. Revisa los cambios antes de guardar.",
      })
    } catch (error) {
      console.error("Error completo:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al mejorar el contenido con IA",
        variant: "destructive",
      })
    } finally {
      setIsImproving(false)
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const addNewTag = () => {
    const tagName = newTagInput.trim()
    if (!tagName) return

    // Verificar si la etiqueta ya existe en las predefinidas
    const existingTag = allTags.find((tag) => tag.name.toLowerCase() === tagName.toLowerCase())
    if (existingTag) {
      if (!selectedTags.includes(existingTag.id)) {
        toggleTag(existingTag.id)
      }
    } else if (
      !customTags.includes(tagName) &&
      !customTags.some((tag) => tag.toLowerCase() === tagName.toLowerCase())
    ) {
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <Button type="button" variant="outline" onClick={() => router.push("/admin")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>

        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="publish"
              checked={publishAfterSave}
              onCheckedChange={(checked) => setPublishAfterSave(checked as boolean)}
            />
            <Label htmlFor="publish" className="font-normal">
              Publicar al guardar
            </Label>
          </div>

          <Button type="submit" className="bg-purple-600 hover:bg-purple-700 gap-2" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar cambios
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la historia"
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
        <Label>Etiquetas</Label>
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
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
            </Badge>
          ))}
        </div>

        <div className="flex items-center space-x-2 mt-4">
          <Input
            ref={newTagInputRef}
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            placeholder="Añadir nueva etiqueta"
          />
          <Button
            type="button"
            onClick={addNewTag}
            disabled={!newTagInput.trim()}
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

        <p className="text-xs text-muted-foreground mt-1">{getTotalTagsCount()} etiquetas seleccionadas</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Contenido</Label>
          <Button
            type="button"
            variant="outline"
            onClick={handleImproveWithAI}
            disabled={isImproving || !content.trim()}
            className="gap-2"
          >
            {isImproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Mejorar con IA
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="original" className="flex gap-2">
              Original
              {activeTab === "original" && <Check className="h-4 w-4" />}
            </TabsTrigger>
            <TabsTrigger value="improved" disabled={!improvedContent} className="flex gap-2">
              Mejorado con IA
              {activeTab === "improved" && <Check className="h-4 w-4" />}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="original">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Contenido de la historia"
              className="min-h-[300px]"
              required
            />
          </TabsContent>
          <TabsContent value="improved">
            <Textarea
              value={improvedContent}
              onChange={(e) => setImprovedContent(e.target.value)}
              placeholder="Contenido mejorado con IA"
              className="min-h-[300px]"
              required
            />
          </TabsContent>
        </Tabs>
      </div>
    </form>
  )
}
