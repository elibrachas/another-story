import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { CommentForm } from "@/components/comment-form"
import { submitComment } from "@/lib/actions"

// Mock de las dependencias
jest.mock("@/lib/actions", () => ({
  submitComment: jest.fn(),
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

describe("CommentForm Component", () => {
  const mockStoryId = "story-123"

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders the comment form correctly", () => {
    render(<CommentForm storyId={mockStoryId} />)

    expect(screen.getByPlaceholderText("Comparte tus pensamientos...")).toBeInTheDocument()
    expect(screen.getByText("Comentar anónimamente")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /Publicar Comentario/i })).toBeInTheDocument()
  })

  it("allows typing in the comment textarea", () => {
    render(<CommentForm storyId={mockStoryId} />)

    const textarea = screen.getByPlaceholderText("Comparte tus pensamientos...")
    fireEvent.change(textarea, { target: { value: "This is a test comment" } })

    expect(textarea).toHaveValue("This is a test comment")
  })

  it("toggles anonymous checkbox", () => {
    render(<CommentForm storyId={mockStoryId} />)

    const checkbox = screen.getByRole("checkbox")
    expect(checkbox).toBeChecked() // Por defecto debería estar marcado

    fireEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it("submits the comment when form is submitted", async () => {
    ;(submitComment as jest.Mock).mockResolvedValue({ success: true })

    render(<CommentForm storyId={mockStoryId} />)

    const textarea = screen.getByPlaceholderText("Comparte tus pensamientos...")
    fireEvent.change(textarea, { target: { value: "This is a test comment" } })

    const submitButton = screen.getByRole("button", { name: /Publicar Comentario/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(submitComment).toHaveBeenCalledWith({
        storyId: mockStoryId,
        content: "This is a test comment",
        isAnonymous: true,
      })
    })
  })

  it("shows error toast when comment is empty", async () => {
    const mockToast = jest.fn()
    jest.mock("@/components/ui/use-toast", () => ({
      useToast: () => ({
        toast: mockToast,
      }),
    }))

    render(<CommentForm storyId={mockStoryId} />)

    // No escribimos nada en el textarea

    const submitButton = screen.getByRole("button", { name: /Publicar Comentario/i })
    fireEvent.click(submitButton)

    // Verificar que submitComment no fue llamado
    expect(submitComment).not.toHaveBeenCalled()
  })
})
