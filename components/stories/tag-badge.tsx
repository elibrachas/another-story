"use client"

import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { Tag } from "@/lib/types"

type TagBadgeProps = {
  tag: Tag | string
  onClick?: () => void
}

export function TagBadge({ tag, onClick }: TagBadgeProps) {
  // Si tag es un string, creamos un objeto Tag simple
  const tagObj = typeof tag === "string" ? { id: tag, name: tag } : tag

  return (
    <Link href={onClick ? "#" : `/tag/${tagObj.id}`} onClick={onClick}>
      <Badge
        variant="outline"
        className="bg-purple-50 text-purple-800 hover:bg-purple-100 border-purple-200 cursor-pointer dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800"
      >
        {tagObj.name}
      </Badge>
    </Link>
  )
}
