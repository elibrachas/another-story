import type React from "react"
import { render, screen } from "@testing-library/react"
import { StoryCard } from "@/components/story-card"
import type { Story } from "@/lib/types"

// Mock de los componentes necesarios
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

jest.mock("@/components/upvote-button", () => ({
  UpvoteButton: ({ storyId, initialUpvotes }: { storyId: string; initialUpvotes: number }) => (
    <button data-testid="upvote-button">Upvotes: {initialUpvotes}</button>
  ),
}))

jest.mock("@/components/tag-badge", () => ({
  TagBadge: ({ tag }: { tag: any }) => <span data-testid="tag-badge">{tag.name}</span>,
}))

describe("StoryCard Component", () => {
  const mockStory: Story = {
    id: "123",
    title: "Test Story Title",
    content: "This is a test story content that should be long enough to be truncated in the card.",
    author: "TestAuthor",
    industry: "Tecnología",
    upvotes: 42,
    created_at: "2023-01-01T12:00:00Z",
    published: true,
    tags: [
      { id: "tag1", name: "Test Tag 1" },
      { id: "tag2", name: "Test Tag 2" },
    ],
  }

  it("renders story title and truncated content", () => {
    render(<StoryCard story={mockStory} />)

    expect(screen.getByText("Test Story Title")).toBeInTheDocument()
    expect(screen.getByText(/This is a test story content/)).toBeInTheDocument()
  })

  it("displays author and industry information", () => {
    render(<StoryCard story={mockStory} />)

    expect(screen.getByText(/Por: TestAuthor/)).toBeInTheDocument()
    expect(screen.getByText(/Industria: Tecnología/)).toBeInTheDocument()
  })

  it("renders tags when provided", () => {
    render(<StoryCard story={mockStory} />)

    const tagBadges = screen.getAllByTestId("tag-badge")
    expect(tagBadges).toHaveLength(2)
    expect(tagBadges[0]).toHaveTextContent("Test Tag 1")
    expect(tagBadges[1]).toHaveTextContent("Test Tag 2")
  })

  it("includes upvote button with correct count", () => {
    render(<StoryCard story={mockStory} />)

    const upvoteButton = screen.getByTestId("upvote-button")
    expect(upvoteButton).toBeInTheDocument()
    expect(upvoteButton).toHaveTextContent("Upvotes: 42")
  })
})
