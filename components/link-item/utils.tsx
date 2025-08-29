"use client"

import { TwitterIcon, GithubIcon, LinkedinIcon, GlobeIcon, LinkIcon, EmailIcon } from "@/components/icons"

// Function to determine the appropriate icon based on the URL
export const getLinkIcon = (url: string) => {
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
  } else if (
    domain.includes("cronicaslaborales.com") ||
    domain.includes("elibrachas.dev") ||
    domain.includes("portfolio")
  ) {
    return <GlobeIcon size={16} />
  } else {
    return <LinkIcon size={16} />
  }
}
