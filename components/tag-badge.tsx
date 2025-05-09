import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { Tag } from "@/lib/types"

export function TagBadge({ tag, linkable = true }: { tag: Tag; linkable?: boolean }) {
  const badge = (
    <Badge
      variant="outline"
      className="bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:hover:bg-purple-800"
    >
      {tag.name}
    </Badge>
  )

  if (linkable) {
    return <Link href={`/tag/${tag.id}`}>{badge}</Link>
  }

  return badge
}
