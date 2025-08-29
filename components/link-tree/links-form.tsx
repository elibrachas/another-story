"use client"

import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LinkItem } from "@/components/link-item"
import { useThemeSettings } from "@/hooks/use-theme-settings"
import { cn } from "@/lib/utils"
import type { LinkItemProps } from "@/hooks/use-links"

interface LinksFormProps {
  links: LinkItemProps[]
  newLink: { title: string; url: string }
  onNewLinkChange: (field: "title" | "url", value: string) => void
  onAddLink: () => void
  onDeleteLink: (id: string) => void
  onUpdateLink: (link: LinkItemProps) => void
}

export function LinksForm({ links, newLink, onNewLinkChange, onAddLink, onDeleteLink, onUpdateLink }: LinksFormProps) {
  const { themeSettings } = useThemeSettings()

  return (
    <div className={cn("space-y-4", themeSettings.font)}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Link Title</Label>
          <Input
            id="title"
            placeholder="e.g. My Website"
            value={newLink.title}
            onChange={(e) => onNewLinkChange("title", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            placeholder="https://example.com"
            value={newLink.url}
            onChange={(e) => onNewLinkChange("url", e.target.value)}
          />
        </div>
        <Button className="w-full" onClick={onAddLink}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Link
        </Button>
      </div>

      <div className="space-y-2 mt-6">
        <h3 className="font-medium">Your Links</h3>
        {links.length === 0 ? (
          <p className="text-muted-foreground text-sm">No links added yet. Add your first link above.</p>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <LinkItem key={link.id} {...link} isEditMode={true} onDelete={onDeleteLink} onUpdate={onUpdateLink} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
