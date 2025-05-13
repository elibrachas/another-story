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
  LoginDialog: ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => (
    <div data-testid="login-dialog" data-open={open}>
      Login Dialog Mock
    </div>
  ),
}))

// Mock de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, "localStorage", { value: localStorageMock })

describe("UpvoteButton Component", () => {
  const mockStoryId = "story-123"
  const initialUpvotes = 42

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
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

    // Verificar que el contador se incrementó (optimistic update)
    expect(screen.getByText("43")).toBeInTheDocument()

    await waitFor(() => {
      expect(upvoteStory).toHaveBeenCalledWith(mockStoryId)
      expect(localStorageMock.getItem(`upvoted_story_${mockStoryId}`)).toBe("true")
    })
  })

  it("does not allow upvoting again if already upvoted", async () => {
    // Simular que ya se ha votado
    localStorageMock.setItem(`upvoted_story_${mockStoryId}`, "true")

    render(<UpvoteButton storyId={mockStoryId} initialUpvotes={initialUpvotes} />)

    const button = screen.getByRole("button")
    expect(button).toBeDisabled()

    fireEvent.click(button)

    // Verificar que upvoteStory no fue llamado
    expect(upvoteStory).not.toHaveBeenCalled()
  })

  it("shows login dialog when not authenticated", async () => {
    // Cambiar el mock para simular que no hay sesión
    jest.unmock("@/lib/supabase-provider")
    jest.mock("@/lib/supabase-provider", () => ({
      useSupabase: () => ({
        session: null,
      }),
    }))

    render(<UpvoteButton storyId={mockStoryId} initialUpvotes={initialUpvotes} />)

    const button = screen.getByRole("button")
    fireEvent.click(button)

    // Verificar que se muestra el diálogo de login
    const loginDialog = screen.getByTestId("login-dialog")
    expect(loginDialog).toHaveAttribute("data-open", "true")

    // Verificar que upvoteStory no fue llamado
    expect(upvoteStory).not.toHaveBeenCalled()
  })
})
