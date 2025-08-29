"use client"

import { useState } from "react"
import { Edit2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getLinkIcon } from "@/components/link-item/utils"
import { DeleteConfirmation } from "@/components/link-item/delete-confirmation"

interface EditModeProps {
  id: string
  title: string
  url: string
  onDelete: (id: string) => void
  onUpdate: (link: { id: string; title: string; url: string }) => void
}

export function EditMode({ id, title, url, onDelete, onUpdate }: EditModeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(title)
  const [editedUrl, setEditedUrl] = useState(url)

  const handleSave = () => {
    onUpdate({
      id,
      title: editedTitle,
      url: editedUrl,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedTitle(title)
    setEditedUrl(url)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex flex-col space-y-2 p-3 border rounded-lg">
        <Input
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          placeholder="Link title"
          className="mb-1"
        />
        <Input value={editedUrl} onChange={(e) => setEditedUrl(e.target.value)} placeholder="https://example.com" />
        <div className="flex justify-end space-x-2 mt-2">
          <Button size="sm" variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-2 truncate">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white">
          {getLinkIcon(url)}
        </div>
        <div className="truncate">
          <p className="font-medium truncate">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{url}</p>
        </div>
      </div>
      <div className="flex space-x-1">
        <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">Edit link</span>
        </Button>
        <DeleteConfirmation onConfirm={() => onDelete(id)} />
      </div>
    </div>
  )
}
