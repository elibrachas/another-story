import Link from "next/link"
import { Badge } from "@/components/ui/badge"

type TagType = string | { id: string; name: string }

export function TagBadge({ tag }: { tag: TagType }) {
  // Determinar si el tag es un string o un objeto
  const tagId = typeof tag === "object" ? tag.id : tag
  const tagName = typeof tag === "object" ? tag.name : tag

  return (
    <Link href={`/tags/${tagId}`}>
      <Badge
        variant="outline"
        className="bg-purple-800 text-purple-100 hover:bg-purple-700 border-purple-700 cursor-pointer"
      >
        {tagName}
      </Badge>
    </Link>
  )
}
