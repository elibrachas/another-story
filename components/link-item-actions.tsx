"use client"
import { ExternalLink, Copy, Trash2, Share } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface LinkItemActionsProps {
  url: string
  onDelete?: () => void
}

export function LinkItemActions({ url, onDelete }: LinkItemActionsProps) {
  const { toast } = useToast()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url)
    toast({
      title: "Link copied",
      description: "The link has been copied to your clipboard",
    })
  }

  const openLink = () => {
    window.open(url, "_blank")
  }

  const shareLink = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "Check out this link",
          url: url,
        })
        .then(() => {
          toast({
            title: "Link shared",
            description: "The link has been shared successfully",
          })
        })
        .catch((error) => {
          console.error("Error sharing:", error)
        })
    } else {
      copyToClipboard()
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-primary/10 flex items-center justify-center"
          aria-label="Link options"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={openLink} className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4" />
          <span>Open link</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyToClipboard} className="flex items-center gap-2">
          <Copy className="h-4 w-4" />
          <span>Copy URL</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareLink} className="flex items-center gap-2">
          <Share className="h-4 w-4" />
          <span>Share</span>
        </DropdownMenuItem>
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
