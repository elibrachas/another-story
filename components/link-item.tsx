"use client"
import { TwitterIcon, GithubIcon, LinkedinIcon, GlobeIcon, LinkIcon, EmailIcon } from "@/components/icons"
import { ViewMode } from "@/components/link-item/view-mode"
import { EditMode } from "@/components/link-item/edit-mode"

export interface LinkItemProps {
  id: string
  title: string
  url: string
  isEditMode?: boolean
  onDelete?: (id: string) => void
  onUpdate?: (link: LinkItemProps) => void
}

// Function to determine the appropriate icon based on the URL
const getLinkIcon = (url: string) => {
  const domain = url
    .toLowerCase()
    .replace(/https?:\/\//, "")
    .split("/")[0]

  if (domain.includes("twitter.com") || domain.includes("x.com")) {
    return <TwitterIcon size={16} />
  } else if (domain.includes("github.com")) {
    return <GithubIcon size={16} />
  } else if (domain.includes("linkedin.com")) {
    return <LinkedinIcon size={16} />
  } else if (url.startsWith("mailto:")) {
    return <EmailIcon size={16} />
  } else if (domain.includes("elibrachas.dev") || domain.includes("portfolio")) {
    return <GlobeIcon size={16} />
  } else {
    return <LinkIcon size={16} />
  }
}

export function LinkItem({ id, title, url, isEditMode = false, onDelete, onUpdate }: LinkItemProps) {
  if (isEditMode) {
    return (
      <EditMode id={id} title={title} url={url} onDelete={onDelete || (() => {})} onUpdate={onUpdate || (() => {})} />
    )
  }

  return <ViewMode title={title} url={url} />
}
