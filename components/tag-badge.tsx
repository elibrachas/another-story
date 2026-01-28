import Link from "next/link"

type TagType = string | { id: string; name: string }

export function TagBadge({ tag }: { tag: TagType }) {
  // Determinar si el tag es un string o un objeto
  const tagId = typeof tag === "object" ? tag.id : tag
  const tagName = typeof tag === "object" ? tag.name : tag

  return (
    <Link href={`/tag/${tagId}`}>
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors bg-purple-700 text-white hover:bg-purple-600 border border-purple-600 cursor-pointer">
        {tagName}
      </span>
    </Link>
  )
}
