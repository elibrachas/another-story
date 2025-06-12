import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { UpvoteButton } from "@/components/upvote-button"
import { upvoteStory } from "@/lib/actions"

// Mock de las dependencias
jest.mock("@/lib/actions", () => ({
  upvoteStory: jest.fn(),
}))

jest.mock("@/lib/supabase-provider", () => ({
  useSupabase: () => ({
    session: { user: { id: "test-user-id" } },
  }),
}))

jest.mock("@/components/login-dialog", () => ({
  LoginDialog: ({ open }: { open: boolean }) => (
    <div data-testid="login-dialog" data-open={open} />
  ),
}))

describe("UpvoteButton Component", () => {
  const mockStoryId = "story-123"
  const initialUpvotes = 42

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders with the correct initial upvote count", () => {
    render(<UpvoteButton storyId={mockStoryId} initialUpvotes={initialUpvotes} />)

    expect(screen.getByText("42")).toBeInTheDocument()
  })

  it("increments upvote count and calls upvoteStory when clicked", async () => {
    ;(upvoteStory as jest.Mock).mockResolvedValue({ success: true })

    render(<UpvoteButton storyId={mockStoryId} initialUpvotes={initialUpvotes} />)

    const button = screen.getByRole("button")
    fireEvent.click(button)

    await waitFor(() => {
      expect(upvoteStory).toHaveBeenCalledWith(mockStoryId)
      expect(screen.getByText("43")).toBeInTheDocument()
    })
  })

  it("does not allow upvoting again if already upvoted", async () => {
    ;(upvoteStory as jest.Mock).mockResolvedValue({ success: true })

    render(<UpvoteButton storyId={mockStoryId} initialUpvotes={initialUpvotes} />)

    const button = screen.getByRole("button")
    fireEvent.click(button)

    await waitFor(() => {
      expect(upvoteStory).toHaveBeenCalledTimes(1)
    })

    expect(button).toBeDisabled()

    fireEvent.click(button)

    expect(upvoteStory).toHaveBeenCalledTimes(1)
  })
})
