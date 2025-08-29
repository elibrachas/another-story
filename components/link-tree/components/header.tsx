"use client"

import { Button } from "@/components/ui/button"
import { Edit2, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface HeaderProps {
  isEditMode: boolean
  onToggleEditMode: () => void
}

export function Header({ isEditMode, onToggleEditMode }: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6 px-4">
      <div className="flex items-center gap-4">
        <Link
          href="https://cronicaslaborales.com"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Volver a Crónicas Laborales</span>
        </Link>
      </div>
      <h1 className="text-2xl font-bold">Eli Brachas</h1>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleEditMode}
          aria-label={isEditMode ? "Guardar cambios" : "Editar perfil y enlaces"}
        >
          {isEditMode ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
