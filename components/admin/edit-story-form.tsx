"use client"

import type React from "react"

import { useState } from "react"
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
import { Loader2, Wand2, Save, ArrowLeft, Check, Search } from "lucide-react"
import { improveStoryWithAI } from "@/lib/actions/admin"
import type { Story, Tag } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isImproving, setIsImproving] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [publishAfterSave, setPublishAfterSave] = useState(false)
  const [activeTab, setActiveTab] = useState("original")
  const [showDiagnosticDialog, setShowDiagnosticDialog] = useState(false)
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Ordenar las etiquetas por nombre
  const sortedTags = [...allTags].sort((a, b) => a.name.localeCompare(b.name))

  // Reemplazar completamente la función handleSubmit para usar la nueva API Route
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Determinar explícitamente qué contenido usar
    let finalContent = content
    if (activeTab === "improved" && improvedContent) {
      finalContent = improvedContent
      console.log("USANDO CONTENIDO MEJORADO:", finalContent.substring(0, 50) + "...")
    } else {
      console.log("USANDO CONTENIDO ORIGINAL:", finalContent.substring(0, 50) + "...")
    }

    if (!title || !finalContent || !industry) {
      toast({
        title: "Campos faltantes",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      console.log("Enviando datos para guardar:", {
        id: story.id,
        title,
        contentPreview: finalContent.substring(0, 50) + "...",
        contentLength: finalContent.length,
        activeTab,
        contentSource: activeTab === "improved" ? "mejorado" : "original",
        industry,
        publish: publishAfterSave,
      })

      // Usar la nueva API Route para actualizar la historia
      const response = await fetch("/api/admin/update-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: story.id,
          title,
          content: finalContent,
          industry,
          publish: publishAfterSave,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        const errorMessage = result.error || `Error ${response.status}`
        console.error("Error al actualizar historia:", errorMessage)
        throw new Error(errorMessage)
      }

      console.log("Respuesta de la API:", result)

      toast({
        title: "Historia actualizada",
        description: publishAfterSave
          ? "La historia ha sido actualizada y publicada"
          : "La historia ha sido actualizada",
      })

      router.push("/admin")
    } catch (error) {
      console.error("Error al guardar:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar la historia",
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

  // Añade esta función después de la declaración de handleImproveWithAI
  const handleTabChange = (value: string) => {
    console.log(`Cambiando a pestaña: ${value}`)
    setActiveTab(value)
  }

  // Añadir esta función para manejar la selección de la pestaña mejorada
  const handleSelectImproved = () => {
    if (improvedContent) {
      setActiveTab("improved")
    }
  }

  // Función para verificar el contenido actual en la base de datos
  const checkStoryInDatabase = async () => {
    try {
      setIsChecking(true)
      const response = await fetch(`/api/admin/check-story?id=${story.id}`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        const errorMessage = result.error || `Error ${response.status}`
        console.error("Error al verificar historia:", errorMessage)
        throw new Error(errorMessage)
      }

      setDiagnosticResult(result.story)
      setShowDiagnosticDialog(true)
    } catch (error) {
      console.error("Error al verificar historia:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al verificar la historia",
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <Button type="button" variant="outline" onClick={() => router.push("/admin")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={checkStoryInDatabase}
            disabled={isChecking}
            className="gap-2"
          >
            {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Verificar en BD
          </Button>
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
        <Label>Etiquetas (solo lectura)</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {story.tags && story.tags.length > 0 ? (
            story.tags.map((tag) => (
              <Badge key={tag.id} variant="default" className="bg-purple-600">
                {tag.name}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No hay etiquetas asignadas a esta historia</p>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Las etiquetas originales del usuario no pueden ser modificadas
        </p>
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

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="original" className="flex gap-2">
              Original
              {activeTab === "original" && <Check className="h-4 w-4" />}
            </TabsTrigger>
            <TabsTrigger
              value="improved"
              disabled={!improvedContent}
              className="flex gap-2"
              onClick={handleSelectImproved}
            >
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

      {/* Diálogo de diagnóstico */}
      <Dialog open={showDiagnosticDialog} onOpenChange={setShowDiagnosticDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Información de la historia en la base de datos</DialogTitle>
            <DialogDescription>Esta es la información actual de la historia en la base de datos.</DialogDescription>
          </DialogHeader>
          {diagnosticResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">ID:</div>
                <div>{diagnosticResult.id}</div>
                <div className="font-semibold">Título:</div>
                <div>{diagnosticResult.title}</div>
                <div className="font-semibold">Industria:</div>
                <div>{diagnosticResult.industry}</div>
                <div className="font-semibold">Publicada:</div>
                <div>{diagnosticResult.published ? "Sí" : "No"}</div>
                <div className="font-semibold">Longitud del contenido:</div>
                <div>{diagnosticResult.contentLength} caracteres</div>
                <div className="font-semibold">Última actualización:</div>
                <div>{new Date(diagnosticResult.updatedAt).toLocaleString()}</div>
              </div>
              <div>
                <div className="font-semibold">Vista previa del contenido:</div>
                <div className="mt-2 p-2 border rounded-md bg-muted text-sm">{diagnosticResult.contentPreview}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDiagnosticDialog(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}
