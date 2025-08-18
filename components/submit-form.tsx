"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, Send } from "lucide-react"
import { submitStory } from "@/lib/actions"
import { toast } from "sonner"

const industries = [
  "Tecnología",
  "Salud",
  "Educación",
  "Finanzas",
  "Retail",
  "Manufactura",
  "Consultoría",
  "Marketing",
  "Recursos Humanos",
  "Ventas",
  "Administración",
  "Construcción",
  "Transporte",
  "Turismo",
  "Gastronomía",
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

export function SubmitForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({ title: false, content: false })

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      const result = await submitStory(formData)
      if (result.success) {
        toast.success("Historia enviada correctamente. Será revisada antes de publicarse.")
        // Reset form
        const form = document.getElementById("story-form") as HTMLFormElement
        form?.reset()
      } else {
        toast.error(result.error || "Error al enviar la historia")
      }
    } catch (error) {
      toast.error("Error al enviar la historia")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Comparte tu Historia
        </CardTitle>
        <CardDescription>
          Ayuda a otros compartiendo tu experiencia laboral. Tu historia puede hacer la diferencia.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Tu historia será revisada antes de ser publicada. Todas las historias son anónimas por defecto.
          </AlertDescription>
        </Alert>

        {/* Nueva sección informativa con enlace a Telegram */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            <strong>Proceso de publicación:</strong> Tu historia será revisada antes de ser publicada. Todas las
            historias son anónimas por defecto.
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

        <form id="story-form" action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className={formErrors.title ? "text-red-500" : ""}>
              Título {formErrors.title && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Ej: Mi experiencia con un jefe tóxico"
              required
              maxLength={200}
              onChange={(e) => setFormErrors({ ...formErrors, title: e.target.value.trim() === "" })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className={formErrors.content ? "text-red-500" : ""}>
              Tu historia {formErrors.content && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id="content"
              name="content"
              placeholder="Cuéntanos tu experiencia laboral. Sé específico pero evita mencionar nombres reales de personas o empresas."
              required
              minLength={50}
              rows={8}
              className="resize-none"
              onChange={(e) => setFormErrors({ ...formErrors, content: e.target.value.trim().length < 50 })}
            />
            <p className="text-xs text-gray-500">Mínimo 50 caracteres</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industria</Label>
              <Select name="industry">
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una industria" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Select name="country">
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu país" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (opcional)</Label>
            <Input
              id="tags"
              name="tags"
              placeholder="Ej: acoso, discriminación, burnout (separados por comas)"
              maxLength={200}
            />
            <p className="text-xs text-gray-500">Separa los tags con comas</p>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
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
  )
}
