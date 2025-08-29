"use client"
import { ViewMode } from "@/components/link-tree/components/view-mode"
import { EditMode } from "@/components/link-tree/components/edit-mode"

export interface LinkItemProps {
  id: string
  title: string
  url: string
  isEditMode?: boolean
  onDelete?: (id: string) => void
  onUpdate?: (link: LinkItemProps) => void
}

export function LinkItem({ id, title, url, isEditMode = false, onDelete, onUpdate }: LinkItemProps) {
  if (isEditMode) {
    return (
      <EditMode id={id} title={title} url={url} onDelete={onDelete || (() => {})} onUpdate={onUpdate || (() => {})} />
    )
  }

  return <ViewMode title={title} url={url} />
}
