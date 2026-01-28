import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { SubmitForm } from "@/components/submit-form"
import { submitStory } from "@/lib/actions"

const mockToast = jest.fn()

jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}))

// Mock del componente Select de shadcn para pruebas
jest.mock("@/components/ui/select", () => {
  const React = require("react")
  const SelectContext = React.createContext(null)
  const Select = ({ onValueChange, children }: any) => (
    <SelectContext.Provider value={onValueChange}>
      <div>{children}</div>
    </SelectContext.Provider>
  )
  const SelectTrigger = ({ children }: any) => <button>{children}</button>
  const SelectValue = ({ placeholder }: any) => <span>{placeholder}</span>
  const SelectContent = ({ children }: any) => <div>{children}</div>
  const SelectItem = ({ children, value }: any) => {
    const onValueChange = React.useContext(SelectContext)
    return <div onClick={() => onValueChange?.(value)}>{children}</div>
  }
  return { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
})

jest.mock("@/lib/actions", () => ({
  submitStory: jest.fn(),
}))

jest.mock("@/lib/supabase-provider", () => ({
  useSupabase: () => ({
    session: { user: { id: "test-user-id" } },
  }),
}))

describe("SubmitForm", () => {
  const mockTags = [
    { id: "1", name: "Acoso", count: 10 },
    { id: "2", name: "Discriminación", count: 5 },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("muestra error cuando falta el título", async () => {
    render(<SubmitForm tags={mockTags} />)

    fireEvent.click(screen.getByText("Enviar Historia"))

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          description: "El título es obligatorio",
        }),
      )
    })

    expect(submitStory).not.toHaveBeenCalled()
  })

  test("envía el formulario cuando todos los campos están completos", async () => {
    ;(submitStory as jest.Mock).mockResolvedValue({ success: true })

    render(<SubmitForm tags={mockTags} />)

    fireEvent.change(screen.getByLabelText(/título de tu historia/i), {
      target: { value: "Mi historia toxica" },
    })

    fireEvent.click(screen.getByText("Tecnología"))

    fireEvent.change(screen.getByLabelText(/tu historia/i), {
      target: { value: "Contenido suficientemente largo para pasar la validación del formulario." },
    })

    fireEvent.click(screen.getByText("Enviar Historia"))

    await waitFor(() => {
      expect(submitStory).toHaveBeenCalled()
    })

    const formData = (submitStory as jest.Mock).mock.calls[0][0] as FormData
    expect(formData.get("title")).toBe("Mi historia toxica")
    expect(formData.get("industry")).toBe("Tecnología")
    expect(formData.get("content")).toBe("Contenido suficientemente largo para pasar la validación del formulario.")

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining("Historia enviada"),
        }),
      )
    })
  })
})
